// hooks/useStates.ts
import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";

export const useStates = () => {
    return useQuery({
        queryKey: ['states'],
        queryFn: adminApi.getStates,
    });
};