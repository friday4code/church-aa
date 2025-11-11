// hooks/useStates.ts
import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";

export const useAttendance = () => {
    return useQuery({
        queryKey: ['attendance'],
        queryFn: adminApi.getAttendance,
    });
};