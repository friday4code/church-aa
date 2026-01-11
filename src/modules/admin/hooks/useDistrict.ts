// hooks/useDistrict.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { adminApi } from "@/api/admin.api";

interface UseDistrictsOptions {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onCreateError?: (error: any) => void;
    onUpdateError?: (error: any) => void;
    onDeleteError?: (error: any) => void;
}

export const useDistricts = (options: UseDistrictsOptions = {}) => {
    const queryClient = useQueryClient();

    const {
        onCreateSuccess,
        onUpdateSuccess,
        onDeleteSuccess,
        onCreateError,
        onUpdateError,
        onDeleteError
    } = options;

    const { data: districts = [], isLoading, error } = useQuery({
        queryKey: ['districts'],
        queryFn: adminApi.getDistricts,
    });

    const createDistrict = useMutation({
        mutationFn: adminApi.createDistrict,
        onSuccess: async () => {
            onCreateSuccess?.();
            toaster.create({
                description: "District created successfully",
                type: "success",
                closable: true,
            });
            
            await queryClient.invalidateQueries({ queryKey: ['districts'] });
        },
        onError: (error) => {
            toaster.create({
                description: "Failed to create district",
                type: "error",
                closable: true,
            });

            onCreateError?.(error);
        }
    });

    const updateDistrict = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            adminApi.updateDistrict(id, data),
        onSuccess: async () => {
            onUpdateSuccess?.();
            toaster.create({
                description: "District updated successfully",
                type: "success",
                closable: true,
            });
                await queryClient.invalidateQueries({ queryKey: ['districts'] });
        },
        onError: (error) => {
            toaster.create({
                description: "Failed to update district",
                type: "error",
                closable: true,
            });

            onUpdateError?.(error);
        }
    });

    const deleteDistrict = useMutation({
        mutationFn: adminApi.deleteDistrict,
        onSuccess: async () => {
            onDeleteSuccess?.();
            toaster.create({
                description: "District deleted successfully",
                type: "success",
                closable: true,
            });
            await queryClient.invalidateQueries({ queryKey: ['districts'] });
        },
        onError: (error) => {
            toaster.create({
                description: "Failed to delete district",
                type: "error",
                closable: true,
            });

            onDeleteError?.(error);
        }
    });

    return {
        districts,
        isLoading,
        error,
        createDistrict: createDistrict.mutate,
        updateDistrict: updateDistrict.mutate,
        deleteDistrict: deleteDistrict.mutate,
        isCreating: createDistrict.isPending,
        isUpdating: updateDistrict.isPending,
        isDeleting: deleteDistrict.isPending,
    };
};