// hooks/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { adminApi } from "@/api/admin.api";

interface UseRolesOptions {
    onCreateSuccess?: () => void;
    // onUpdateSuccess?: () => void;
    // onDeleteSuccess?: () => void;
    // onCreateError?: (error: any) => void;
    // onUpdateError?: (error: any) => void;
    // onDeleteError?: (error: any) => void;
}

export const useRoles = (options: UseRolesOptions = {}) => {
    const queryClient = useQueryClient();

    const {
        onCreateSuccess,
        // onUpdateSuccess,
        // onDeleteSuccess,
        // onCreateError,
        // onUpdateError,
        // onDeleteError
    } = options;

    const { data: roles = [], isLoading, error } = useQuery({
        queryKey: ['roles'],
        queryFn: adminApi.getRoles,
    });

    // const createRole = useMutation({
    //     mutationFn: adminApi.createRole,
    //     onSuccess: async () => {
    //         onCreateSuccess?.();
    //         toaster.create({
    //             description: "Role created successfully",
    //             type: "success",
    //             closable: true,
    //         });
            
    //         await queryClient.invalidateQueries({ queryKey: ['roles'] });
    //     },
    //     onError: (error) => {
    //         toaster.create({
    //             description: "Failed to create role",
    //             type: "error",
    //             closable: true,
    //         });

    //         onCreateError?.(error);
    //     }
    // });

    // const updateRole = useMutation({
    //     mutationFn: ({ id, data }: { id: string | number; data: any }) =>
    //         adminApi.updateRole(id, data),
    //     onSuccess: async () => {
    //         onUpdateSuccess?.();
    //         toaster.create({
    //             description: "Role updated successfully",
    //             type: "success",
    //             closable: true,
    //         });
    //         await queryClient.invalidateQueries({ queryKey: ['roles'] });
    //     },
    //     onError: (error) => {
    //         toaster.create({
    //             description: "Failed to update role",
    //             type: "error",
    //             closable: true,
    //         });

    //         onUpdateError?.(error);
    //     }
    // });

    // const deleteRole = useMutation({
    //     mutationFn: adminApi.deleteRole,
    //     onSuccess: async () => {
    //         onDeleteSuccess?.();
    //         toaster.create({
    //             description: "Role deleted successfully",
    //             type: "success",
    //             closable: true,
    //         });
    //         await queryClient.invalidateQueries({ queryKey: ['roles'] });
    //     },
    //     onError: (error) => {
    //         toaster.create({
    //             description: "Failed to delete role",
    //             type: "error",
    //             closable: true,
    //         });

    //         onDeleteError?.(error);
    //     }
    // });

    return {
        roles,
        isLoading,
        error,
        // createRole: createRole.mutate,
        // updateRole: updateRole.mutate,
        // deleteRole: deleteRole.mutate,
        // isCreating: createRole.isPending,
        // isUpdating: updateRole.isPending,
        // isDeleting: deleteRole.isPending,
    };
};