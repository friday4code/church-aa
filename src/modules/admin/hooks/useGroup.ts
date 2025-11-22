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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toaster.success({ description: "Group created successfully", closable: true });
            options?.onCreateSuccess?.();
        },
        onError: (error: any) => {
            toaster.error(error.message || "Failed to create group");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: any }) => adminApi.updateGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toaster.success({ description: "Group updated successfully", closable: true });

            options?.onUpdateSuccess?.();
        },
        onError: (error: any) => {
            toaster.error(error.message || "Failed to update group");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toaster.success({ description:"Group deleted successfully" , closable: true });

            options?.onDeleteSuccess?.();
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