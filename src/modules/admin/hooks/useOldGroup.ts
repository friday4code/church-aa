// hooks/useStates.ts
import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";

export const useOldGroups = () => {
    return useQuery({
        queryKey: ['oldGroups'],
        queryFn: adminApi.getOldGroups,
    });
};