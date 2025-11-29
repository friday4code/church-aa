import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import type { User } from "@/types/users.type";
import { useAuthStore } from "@/store/auth.store";

interface UseMeReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

export const useMe = (): UseMeReturn => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await authApi.getCurrentUser();
        return response?.user || null;
      } catch (error: any) {
        // If we get a 401 (unauthorized), clear auth state and redirect to login
        if (error.response?.status === 401) {
          logout();
          // Clear all queries to prevent stale data issues
          queryClient.clear();
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors - token is invalid
      if (error.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: query.data || null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

