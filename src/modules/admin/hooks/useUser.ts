import { adminApi } from "@/api/admin.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: adminApi.getUsers,
    });
};

export const useUserMutations = () => {
    const queryClient = useQueryClient();

    const createUser = useMutation({
        mutationFn: adminApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const updateUser = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const deleteUser = useMutation({
        // mutationFn: adminApi.deleteUser,
        mutationFn: (id: number) => adminApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    return {
        createUser,
        updateUser,
        deleteUser,
        isCreating: createUser.isPending,
        isUpdating: updateUser.isPending,
        isDeleting: deleteUser.isPending,
    };
};