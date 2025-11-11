// hooks/useStates.ts
import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";

export const useDistricts = () => {
    return useQuery({
        queryKey: ['districts'],
        queryFn: adminApi.getDistricts,
    });
};