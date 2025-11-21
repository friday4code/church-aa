import type { District, Districts } from "@/types/districts.type";
import { axiosClient } from "../config/axios.config"
import type { AttendanceRecord } from "@/types/attendance.type";
import type { CreateYouthAttendanceData, UpdateYouthAttendanceData, YouthAttendanceFilters, YouthAttendanceResponse, YouthAttendancesResponse } from "@/types/youthAttendance.type";
import type { AttendanceMonitoring } from "@/types/attendance-monitoring.type";

export const adminApi = {
    // Users
    getAttendanceMonitoring: async (): Promise<AttendanceMonitoring> => {
        const { data } = await axiosClient.get<any>("/attendance-monitor/monitor/attendance");
        return data;
    },

    sendAttendanceReminder: async (entityType: string): Promise<{
        "sent_to": string[]
    }> => {
        const { data } = await axiosClient.post<{
            "sent_to": string[]
        }>(`/attendance-monitor/monitor/remind/${entityType}`);
        return data;
    },

    sendAttendanceEntityReminder: async (entityType: string, entityId: number): Promise<{
        "sent_to": string[]
    }> => {
        const { data } = await axiosClient.post<{
            "sent_to": string[]
        }>(`/attendance-monitor/monitor/remind/${entityType}/${entityId}`);
        return data;
    },


    // Users
    getUsers: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/api/users/");
        return data;
    },

    createUser: async (userData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/api/users/", userData);
        return data;
    },

    updateUser: async (userId: string | number, userData: any): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/api/users/${userId}`, userData);
        return data;
    },
    deleteUser: async (userId: number): Promise<any> => {
        const { data } = await axiosClient.delete<any>(`/api/users/${userId}`);
        return data;
    },

    // Attendance - updated to use proper types
    getAttendance: async (): Promise<AttendanceRecord[]> => {
        const { data } = await axiosClient.get<AttendanceRecord[]>("/attendance/attendance");
        return data;
    },

    getAttendanceById: async (attendanceId: string | number): Promise<AttendanceRecord> => {
        const { data } = await axiosClient.get<AttendanceRecord>(`/attendance/attendance/${attendanceId}`);
        return data;
    },

    createAttendance: async (attendanceData: any): Promise<AttendanceRecord> => {
        const { data } = await axiosClient.post<AttendanceRecord>("/attendance/attendance", attendanceData);
        return data;
    },

    updateAttendance: async (attendanceId: string | number, attendanceData: any): Promise<AttendanceRecord> => {
        const { data } = await axiosClient.put<AttendanceRecord>(`/attendance/attendance/${attendanceId}`, attendanceData);
        return data;
    },

    deleteAttendance: async (attendanceId: string | number): Promise<void> => {
        await axiosClient.delete(`/attendance/attendance/${attendanceId}`);
    },

    uploadAttendanceCSV: async (fileData: FormData): Promise<any> => {
        const { data } = await axiosClient.post<any>("/attendance/attendance/upload", fileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    // Authentication
    createAdmin: async (adminData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/auth/create-admin", adminData);
        return data;
    },

    login: async (credentials: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/auth/login", credentials);
        return data;
    },

    getCurrentUser: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/auth/me");
        return data;
    },

    refreshToken: async (): Promise<any> => {
        const { data } = await axiosClient.post<any>("/auth/refresh");
        return data;
    },

    // States
    getStates: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/hierarchy/states");
        return data;
    },

    createState: async (stateData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/hierarchy/states", stateData);
        return data;
    },

    updateState: async (stateId: string | number, stateData: any): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/hierarchy/state/${stateId}`, stateData);
        return data;
    },

    deleteState: async (stateId: string | number): Promise<any> => {
        const { data } = await axiosClient.delete<any>(`/hierarchy/state/${stateId}`);
        return data;
    },

    uploadStates: async (fileData: FormData): Promise<any> => {
        const { data } = await axiosClient.post<any>("/hierarchy/states/upload", fileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    // Regions
    getRegions: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/hierarchy/regions");
        return data;
    },

    getRegionsByState: async (stateId: string | number): Promise<any> => {
        const { data } = await axiosClient.get<any>(`/hierarchy/regions/by_state/${stateId}`);
        return data;
    },

    createRegion: async (regionData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/hierarchy/regions", regionData);
        return data;
    },

    updateRegion: async (regionId: string | number, regionData: any): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/hierarchy/region/${regionId}`, regionData);
        return data;
    },

    deleteRegion: async (regionId: string | number): Promise<any> => {
        const { data } = await axiosClient.delete<any>(`/hierarchy/region/${regionId}`);
        return data;
    },

    // Districts
    getDistricts: async (): Promise<Districts> => {
        const { data } = await axiosClient.get<Districts>("/hierarchy/districts");
        return data;
    },

    getDistrictsByRegion: async (regionId: string | number): Promise<any> => {
        const { data } = await axiosClient.get<any>(`/hierarchy/districts/by_region/${regionId}`);
        return data;
    },

    createDistrict: async (districtData: District): Promise<any> => {
        const { data } = await axiosClient.post<District>("/hierarchy/districts", districtData);
        return data;
    },

    updateDistrict: async (districtId: string | number, districtData: Partial<District>): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/hierarchy/district/${districtId}`, districtData);
        return data;
    },

    deleteDistrict: async (districtId: string | number): Promise<any> => {
        const { data } = await axiosClient.delete<any>(`/hierarchy/district/${districtId}`);
        return data;
    },

    // Groups
    getGroups: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/hierarchy/groups");
        return data;
    },

    getGroupsByDistrict: async (districtId: string | number): Promise<any> => {
        const { data } = await axiosClient.get<any>(`/hierarchy/groups/by_district/${districtId}`);
        return data;
    },

    createGroup: async (groupData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/hierarchy/groups", groupData);
        return data;
    },

    updateGroup: async (groupId: string | number, groupData: any): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/hierarchy/group/${groupId}`, groupData);
        return data;
    },

    deleteGroup: async (groupId: string | number): Promise<any> => {
        const { data } = await axiosClient.delete<any>(`/hierarchy/groups/${groupId}`);
        return data;
    },

    // Old Groups
    getOldGroups: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/hierarchy/oldgroups");
        return data;
    },

    getOldGroupsByGroup: async (groupId: string | number): Promise<any> => {
        const { data } = await axiosClient.get<any>(`/hierarchy/oldgroups/by_group/${groupId}`);
        return data;
    },

    createOldGroup: async (oldGroupData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/hierarchy/oldgroups", oldGroupData);
        return data;
    },
    updateOldGroup: async (oldGroupId: string | number, groupData: any): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/hierarchy/oldgroups/${oldGroupId}`, groupData);
        return data;
    },

    deleteOldGroup: async (groupId: string | number): Promise<any> => {
        const { data } = await axiosClient.delete<any>(`/hierarchy/groups/${groupId}`);
        return data;
    },


    // Youth Attendance
    getYouthAttendance: async (filters?: YouthAttendanceFilters): Promise<YouthAttendancesResponse> => {
        const params = new URLSearchParams();
        if (filters?.attendance_type) params.append('attendance_type', filters.attendance_type);
        if (filters?.year) params.append('year', filters.year.toString());
        if (filters?.month) params.append('month', filters.month);

        const { data } = await axiosClient.get<YouthAttendancesResponse>(`/youth-attendance/youth-attendance?${params.toString()}`);
        return data;
    },

    getYouthAttendanceById: async (yaId: string | number): Promise<YouthAttendanceResponse> => {
        const { data } = await axiosClient.get<YouthAttendanceResponse>(`/youth-attendance/youth-attendance/${yaId}`);
        return data;
    },

    createYouthAttendance: async (attendanceData: CreateYouthAttendanceData): Promise<YouthAttendanceResponse> => {
        const { data } = await axiosClient.post<YouthAttendanceResponse>("/youth-attendance/youth-attendance", attendanceData);
        return data;
    },

    updateYouthAttendance: async (yaId: string | number, attendanceData: UpdateYouthAttendanceData): Promise<YouthAttendanceResponse> => {
        const { data } = await axiosClient.put<YouthAttendanceResponse>(`/youth-attendance/youth-attendance/${yaId}`, attendanceData);
        return data;
    },

    deleteYouthAttendance: async (yaId: string | number): Promise<void> => {
        await axiosClient.delete(`/youth-attendance/youth-attendance/${yaId}`);
    },

    uploadYouthAttendanceCSV: async (fileData: FormData, attendanceType: 'weekly' | 'revival'): Promise<any> => {
        const { data } = await axiosClient.post<any>(`/youth-attendance/youth-attendance/upload?attendance_type=${attendanceType}`, fileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
}