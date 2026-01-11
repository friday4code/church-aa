// hooks/useYouthAttendance.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin.api"
import type { CreateYouthAttendanceData, UpdateYouthAttendanceData, YouthAttendanceFilters } from "@/types/youthAttendance.type"

const YOUTH_ATTENDANCE_QUERY_KEY = ['youthAttendance']

export const useYouthAttendance = (filters?: YouthAttendanceFilters) => {
    return useQuery({
        queryKey: [...YOUTH_ATTENDANCE_QUERY_KEY, filters],
        queryFn: () => adminApi.getYouthAttendance(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useYouthAttendanceById = (yaId: string | number) => {
    return useQuery({
        queryKey: [...YOUTH_ATTENDANCE_QUERY_KEY, yaId],
        queryFn: () => adminApi.getYouthAttendanceById(yaId),
        enabled: !!yaId,
        staleTime: 5 * 60 * 1000,
    })
}

export const useCreateYouthAttendance = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (data: CreateYouthAttendanceData) => adminApi.createYouthAttendance(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: YOUTH_ATTENDANCE_QUERY_KEY,
            })
        },
    })
}

export const useUpdateYouthAttendance = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ yaId, data }: { yaId: string | number; data: UpdateYouthAttendanceData }) =>
            adminApi.updateYouthAttendance(yaId, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: YOUTH_ATTENDANCE_QUERY_KEY,
            })
        },
    })
}

export const useDeleteYouthAttendance = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (yaId: string | number) => adminApi.deleteYouthAttendance(yaId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: YOUTH_ATTENDANCE_QUERY_KEY,
            })
        },
    })
}

export const useUploadYouthAttendanceCSV = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ fileData, attendanceType }: { fileData: FormData; attendanceType: 'weekly' | 'revival' }) =>
            adminApi.uploadYouthAttendanceCSV(fileData, attendanceType),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: YOUTH_ATTENDANCE_QUERY_KEY,
            })
        },
    })
}
