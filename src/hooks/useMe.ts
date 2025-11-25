import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import type { User } from "@/types/users.type";

interface UseMeReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

export const useMe = (): UseMeReturn => {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response?.user || null;
    },
  });

  return {
    user: query.data!,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

