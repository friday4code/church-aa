// hooks/useRegion.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { adminApi } from "@/api/admin.api";
import { delay } from "@/utils/helpers";

export interface Region {
    id: number;
    name: string;
    state_id?: number;
}

interface UseRegionsOptions {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onCreateError?: (error: any) => void;
    onUpdateError?: (error: any) => void;
    onDeleteError?: (error: any) => void;
}

export const useRegions = (options: UseRegionsOptions = {}) => {
    const queryClient = useQueryClient();

    const {
        onCreateSuccess,
        onUpdateSuccess,
        onDeleteSuccess,
        onCreateError,
        onUpdateError,
        onDeleteError
    } = options;

    const { data: regions = [], isLoading, error } = useQuery({
        queryKey: ['regions'],
        queryFn: adminApi.getRegions,
    });

    const createRegion = useMutation({
        mutationFn: adminApi.createRegion,
        onSuccess: async () => {

            // Call the lifted callback
            onCreateSuccess?.();
            toaster.create({
                description: "Region created successfully",
                type: "success",
                closable: true,
            });

            await queryClient.invalidateQueries({ queryKey: ['regions'] });

        },
        onError: (error) => {
            toaster.create({
                description: "Failed to create region",
                type: "error",
                closable: true,
            });

            // Call the lifted error callback
            onCreateError?.(error);
        }
    });

    const updateRegion = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            adminApi.updateRegion(id, data),
        onSuccess: async () => {



            // Call the lifted callback
            onUpdateSuccess?.();
            toaster.create({
                description: "Region updated successfully",
                type: "success",
                closable: true,
            });
            
            await queryClient.invalidateQueries({ queryKey: ['regions'] });
        },
        onError: (error) => {
            toaster.create({
                description: "Failed to update region",
                type: "error",
                closable: true,
            });

            // Call the lifted error callback
            onUpdateError?.(error);
        }
    });

    const deleteRegion = useMutation({
        mutationFn: adminApi.deleteRegion,
        onSuccess: async () => {

            // Call the lifted callback
            onDeleteSuccess?.();

            toaster.create({
                description: "Region deleted successfully",
                type: "success",
                closable: true,
            });

                await queryClient.invalidateQueries({ queryKey: ['regions'] });

        },
        onError: (error) => {
            toaster.create({
                description: "Failed to delete region",
                type: "error",
                closable: true,
            });

            // Call the lifted error callback
            onDeleteError?.(error);
        }
    });

    return {
        regions,
        isLoading,
        error,
        createRegion: createRegion.mutate,
        updateRegion: updateRegion.mutate,
        deleteRegion: deleteRegion.mutate,
        isCreating: createRegion.isPending,
        isUpdating: updateRegion.isPending,
        isDeleting: deleteRegion.isPending,
    };
};