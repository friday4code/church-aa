import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: adminApi.getUsers,
    });
};