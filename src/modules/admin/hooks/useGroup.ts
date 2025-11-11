// hooks/useStates.ts
import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";

export const useGroups = () => {
    return useQuery({
        queryKey: ['groups'],
        queryFn: adminApi.getGroups,
    });
};