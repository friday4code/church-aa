import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";

export const useRegions = () => {
    return useQuery({
        queryKey: ['regions'],
        queryFn: adminApi.getRegions,
    });
};
