// axios.config.ts
import { toaster } from "@/components/ui/toaster"
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { ENV } from "./env"
import { useAuthStore } from "@/store/auth.store"
import { networkMonitor } from "@/utils/network.utils"

export const axiosClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
  },
  // Enable response compression
  decompress: true,
  // Optimize for large datasets
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
})

// List of public endpoints that don't require auth token
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/refresh-token',
  // Add any other public endpoints here
];

// Helper to check if endpoint is public
const isPublicEndpoint = (url: string = ''): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint =>
    url.endsWith(endpoint)
  );
};

// Helper functions
const getErrorMessage = (error: any): string => {
  if (error.response?.data) {
    const { message, errors } = error.response.data;

    if (errors && Array.isArray(errors) && errors.length > 0) {
      return errors.map(err => `${err.field}: ${err.message}`).join(', ');
    }

    return message || "Invalid request sent to the server.";
  }

  return error.message || "Invalid request sent to the server.";
};

const getErrorTitle = (error: AxiosError): string => {
  if (!error.response) return "Network Error";

  const status = error.response.status;
  const statusText = error.response.statusText;

  switch (status) {
    case 400: return "Bad Request";
    case 401: return "Unauthorized";
    case 402: return "Payment Required";
    case 403: return "Forbidden";
    case 404: return "Not Found";
    case 405: return "Method Not Allowed";
    case 406: return "Not Acceptable";
    case 408: return "Request Timeout";
    case 409: return "Conflict";
    case 410: return "Gone";
    case 411: return "Length Required";
    case 412: return "Precondition Failed";
    case 413: return "Payload Too Large";
    case 414: return "URI Too Long";
    case 415: return "Unsupported Media Type";
    case 416: return "Range Not Satisfiable";
    case 417: return "Expectation Failed";
    case 418: return "I'm a teapot";
    case 422: return "Validation Error";
    case 429: return "Too Many Requests";
    case 500: return "Internal Server Error";
    case 501: return "Not Implemented";
    case 502: return "Bad Gateway";
    case 503: return "Service Unavailable";
    case 504: return "Gateway Timeout";
    case 505: return "HTTP Version Not Supported";
    case 506: return "Variant Also Negotiates";
    case 507: return "Insufficient Storage";
    case 508: return "Loop Detected";
    case 509: return "Bandwidth Limit Exceeded";
    case 510: return "Not Extended";
    case 511: return "Network Authentication Required";
    default: return `${status} - ${statusText}`;
  }
};

// Token refresh queue management
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth header for public endpoints
    const isPublic = isPublicEndpoint(config.url);

    if (!isPublic) {
      // Get fresh tokens from store for each request
      const tokens = useAuthStore.getState()?.tokens;

      if (tokens?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${tokens.access_token}`
      }
    }

    // Start network monitoring
    if (config.url) {
      networkMonitor.startRequest(config.url);
    }

    return config
  },
  (error: AxiosError) => {
    toaster.error({
      title: getErrorTitle(error),
      description: getErrorMessage(error),
      closable: true
    });
    return Promise.reject(error)
  },
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest.url === "/auth/login") {
      toaster.error({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        closable: true
      });
    }

    // Unauthorized (Token expired) - Skip for public endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint(originalRequest.url)) {
      console.warn("🟠 Unauthorized (Token expired):", error.config?.url);

      // Handle concurrent refresh requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get fresh tokens for refresh attempt
        const currentTokens = useAuthStore.getState()?.tokens;

        if (!currentTokens?.refresh_token) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${ENV.API_BASE_URL}/auth/refresh-token`, {
          refresh_token: currentTokens.refresh_token,
        });

        const { access_token, refresh_token } = response.data;

        // Update store with new tokens
        useAuthStore.setState({
          tokens: {
            access_token: access_token,
            refresh_token: refresh_token || currentTokens.refresh_token
          }
        });

        // Process queued requests
        isRefreshing = false;
        processQueue(null, access_token);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Process queued requests with error
        isRefreshing = false;
        processQueue(refreshError, null);

        // Token refresh failed → force logout
        useAuthStore.getState().logout();

        toaster.error({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          closable: true
        });

        return Promise.reject(refreshError);
      }
    }

    // Handle other error status codes
    if (error.response?.status && error.response.status >= 400) {
      console.warn(`HTTP ${error.response.status}:`, error.config?.url);

      // Only show toaster for client errors (4xx) and server errors (5xx)
      // but not for 401 which is handled above
      if (error.response.status !== 401) {
        toaster.error({
          title: getErrorTitle(error),
          description: getErrorMessage(error),
          closable: true
        });
      }
    }

    // Network or unknown errors
    if (!error.response) {
      console.error("🌐 Network error or no response from server:", error.message);
      toaster.error({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        closable: true
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;