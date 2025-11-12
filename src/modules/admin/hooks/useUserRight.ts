// import { adminApi } from "@/api/admin.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserRightsStore } from "../stores/userRights.store";

export const useUserRights = () => {
    const { userRights } = useUserRightsStore();
    return useQuery({
        queryKey: ['user-rights'],
        // queryFn: adminApi.getUserRights,
        queryFn: () => userRights,
    });
};

export const useUserRightMutations = () => {
    const queryClient = useQueryClient();

    const createUserRight = useMutation({
        // mutationFn: adminApi.createUserRight,
        mutationFn: () => Promise.resolve("added"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-rights'] });
        },
    });

    const updateUserRight = useMutation({
        // mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateUserRight(id, data),
        mutationFn: ({ id, data }: { id: number; data: any }) => Promise.resolve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-rights'] });
        },
    });

    const deleteUserRight = useMutation({
        // mutationFn: adminApi.deleteUserRight,
        mutationFn: () => Promise.resolve("deleted"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-rights'] });
        },
    });

    return {
        createUserRight,
        updateUserRight,
        deleteUserRight,
        isCreating: createUserRight.isPending,
        isUpdating: updateUserRight.isPending,
        isDeleting: deleteUserRight.isPending,
    };
};