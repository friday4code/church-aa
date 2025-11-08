export const ENV = {
    BASE_URL: import.meta.env.VITE_BASE_URL,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 3000
} as const;