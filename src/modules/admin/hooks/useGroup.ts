// hooks/useGroup.ts
import { adminApi } from "@/api/admin.api";
import { toaster } from "@/components/ui/toaster";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGroups = (options?: {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}) => {
    const queryClient = useQueryClient();

    const {
        data: groups = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['groups'],
        queryFn: adminApi.getGroups,
    });

    const createMutation = useMutation({
        mutationFn: adminApi.createGroup,
        onSuccess: async () => {
            options?.onCreateSuccess?.();
            toaster.success({ description: "Group created successfully", closable: true });
            await queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
        onError: (error: any) => {
            toaster.error(error.message || "Failed to create group");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: any }) => adminApi.updateGroup(id, data),
        onSuccess: async () => {
            options?.onUpdateSuccess?.();
            toaster.success({ description: "Group updated successfully", closable: true });
            await queryClient.invalidateQueries({ queryKey: ['groups'] });

        },
        onError: (error: any) => {
            toaster.error(error.message || "Failed to update group");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteGroup,
        onSuccess: async () => {
            options?.onDeleteSuccess?.();
            toaster.success({ description:"Group deleted successfully" , closable: true });
            await queryClient.invalidateQueries({ queryKey: ['groups'] });

        },
        onError: (error: any) => {
            toaster.error(error.message || "Failed to delete group");
        },
    });

    return {
        groups,
        isLoading,
        error,
        createGroup: createMutation.mutate,
        updateGroup: updateMutation.mutate,
        deleteGroup: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};