// hooks/useAttendance.ts
import { adminApi } from "@/api/admin.api";
import { useQuery } from "@tanstack/react-query";
import type { AttendanceRecord } from "@/types/attendance.type";


export const useAttendance = () => {
    return useQuery<AttendanceRecord[]>({
        queryKey: ['attendance'],
        queryFn: adminApi.getAttendance,
        // queryFn: () => Promise.resolve(attendanceData),
    });
};

export const useAttendanceById = (id: number) => {
    return useQuery<AttendanceRecord>({
        queryKey: ['attendance', id],
        queryFn: () => adminApi.getAttendanceById(id),
        enabled: !!id,
    });
};

export const useHierarchyData = () => {
    const { data: states } = useQuery({
        queryKey: ['states'],
        queryFn: adminApi.getStates,
    });

    const { data: regions } = useQuery({
        queryKey: ['regions'],
        queryFn: adminApi.getRegions,
    });

    const { data: districts } = useQuery({
        queryKey: ['districts'],
        queryFn: adminApi.getDistricts,
    });

    const { data: groups } = useQuery({
        queryKey: ['groups'],
        queryFn: adminApi.getGroups,
    });

    const { data: oldGroups } = useQuery({
        queryKey: ['oldGroups'],
        queryFn: adminApi.getOldGroups,
    });

    return {
        states: states || [],
        regions: regions || [],
        districts: districts || [],
        groups: groups || [],
        oldGroups: oldGroups || [],
    };
};