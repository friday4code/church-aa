// hooks/useOldGroups.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin.api"
import type { OldGroupFormData } from "../schemas/oldgroups.schema"

interface UseOldGroupsProps {
    onCreateSuccess?: () => void
    onUpdateSuccess?: () => void
    onDeleteSuccess?: () => void
}

export const useOldGroups = ({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }: UseOldGroupsProps = {}) => {
    const queryClient = useQueryClient()

    const {
        data: oldGroups = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['oldGroups'],
        queryFn: adminApi.getOldGroups,
    })

    const createMutation = useMutation({
        mutationFn: adminApi.createOldGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['oldGroups'] })
            onCreateSuccess?.()
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<OldGroupFormData> }) =>
            adminApi.updateGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['oldGroups'] })
            onUpdateSuccess?.()
        },
    })

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['oldGroups'] })
            onDeleteSuccess?.()
        },
    })

    return {
        oldGroups,
        isLoading,
        error,
        createOldGroup: createMutation.mutate,
        updateOldGroup: updateMutation.mutate,
        deleteOldGroup: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    }
}