import type { District, Districts } from "@/types/districts.type";
import { axiosClient } from "../config/axios.config"

export const adminApi = {
    // Users
    getUsers: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/users/");
        return data;
    },

    createUser: async (userData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/users/", userData);
        return data;
    },

    updateUser: async (userId: string | number, userData: any): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/users/${userId}`, userData);
        return data;
    },

    // Attendance
    getAttendance: async (): Promise<any> => {
        const { data } = await axiosClient.get<any>("/attendance/attendance");
        return data;
    },

    getAttendanceById: async (attendanceId: string | number): Promise<any> => {
        const { data } = await axiosClient.get<any>(`/attendance/attendance/${attendanceId}`);
        return data;
    },

    createAttendance: async (attendanceData: any): Promise<any> => {
        const { data } = await axiosClient.post<any>("/attendance/attendance", attendanceData);
        return data;
    },

    updateAttendance: async (attendanceId: string | number, attendanceData: any): Promise<any> => {
        const { data } = await axiosClient.put<any>(`/attendance/attendance/${attendanceId}`, attendanceData);
        return data;
    },

    deleteAttendance: async (attendanceId: string | number): Promise<any> => {
        const { data } = await axiosClient.delete<any>(`/attendance/attendance/${attendanceId}`);
        return data;
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
}