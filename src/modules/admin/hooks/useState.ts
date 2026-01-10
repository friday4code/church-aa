// hooks/useStates.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { adminApi } from "@/api/admin.api";
import { delay } from "@/utils/helpers";

export interface State {
    id: number;
    name: string;
}

interface UseStatesOptions {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onCreateError?: (error: any) => void;
    onUpdateError?: (error: any) => void;
    onDeleteError?: (error: any) => void;
}

export const useStates = (options: UseStatesOptions = {}) => {
    const queryClient = useQueryClient();

    const {
        onCreateSuccess,
        onUpdateSuccess,
        onDeleteSuccess,
        onCreateError,
        onUpdateError,
        onDeleteError
    } = options;

    const { data: states = [], isLoading, error } = useQuery({
        queryKey: ['states'],
        queryFn: adminApi.getStates,
    });

    const createState = useMutation({
        mutationFn: adminApi.createState,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['states'] });
           
            toaster.create({
                description: "State created successfully",
                type: "success",
                closable: true,
            });


            // Call the lifted callback
            onCreateSuccess?.();
        },
        onError: (error) => {
            toaster.create({
                description: "Failed to create state",
                type: "error",
                closable: true,
            });

            // Call the lifted error callback
            onCreateError?.(error);
        }
    });

    const updateState = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            adminApi.updateState(id, data),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['states'] });
            toaster.create({
                description: "State updated successfully",
                type: "success",
                closable: true,
            });

            // Call the lifted callback
            onUpdateSuccess?.();
        },
        onError: (error) => {
            toaster.create({
                description: "Failed to update state",
                type: "error",
                closable: true,
            });

            // Call the lifted error callback
            onUpdateError?.(error);
        }
    });

    const deleteState = useMutation({
        mutationFn: adminApi.deleteState,
        onSuccess: async () => {
            toaster.create({
                description: "State deleted successfully",
                type: "success",
                closable: true,
            });

            

            queryClient.invalidateQueries({ queryKey: ['states'] });

            // Call the lifted callback
            onDeleteSuccess?.();
        },
        onError: (error) => {
            toaster.create({
                description: "Failed to delete state",
                type: "error",
                closable: true,
            });

            // Call the lifted error callback
            onDeleteError?.(error);
        }
    });

    return {
        states,
        isLoading,
        error,
        createState: createState.mutate,
        updateState: updateState.mutate,
        deleteState: deleteState.mutate,
        isCreating: createState.isPending,
        isUpdating: updateState.isPending,
        isDeleting: deleteState.isPending,
    };
};