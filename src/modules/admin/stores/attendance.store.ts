import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AttendanceFormData } from '../schemas/attendance.schema';

export interface Attendance {
    id: number;
    serviceType: string;
    district: string;
    month: string;
    week: number;
    men: number;
    women: number;
    youthBoys: number;
    youthGirls: number;
    childrenBoys: number;
    childrenGirls: number;
    year: number;
    state?: string;
    region?: string;
    group?: string;
    oldGroup?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface AttendanceStore {
    attendances: Attendance[];
    addAttendance: (serviceType: string, data: AttendanceFormData) => void;
    updateAttendance: (id: number, data: Partial<AttendanceFormData>) => void;
    deleteAttendance: (id: number) => void;
    setAttendances: (attendances: Attendance[]) => void;
    getAttendancesByServiceType: (serviceType: string) => Attendance[];
}

export const useAttendanceStore = create<AttendanceStore>()(
    persist(
        (set, get) => ({
            attendances: [
                // Sunday Worship Service data
                {
                    id: 1,
                    serviceType: 'sunday-worship',
                    district: "Oyigbo",
                    month: "October",
                    week: 5,
                    men: 79,
                    women: 72,
                    youthBoys: 63,
                    youthGirls: 62,
                    childrenBoys: 71,
                    childrenGirls: 90,
                    year: 2022,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    serviceType: 'sunday-worship',
                    district: "Oyigbo",
                    month: "October",
                    week: 3,
                    men: 232,
                    women: 319,
                    youthBoys: 149,
                    youthGirls: 184,
                    childrenBoys: 279,
                    childrenGirls: 262,
                    year: 2022,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // House Caring Fellowship data
                {
                    id: 3,
                    serviceType: 'house-caring',
                    district: "Rumuagholu 2",
                    month: "June",
                    week: 4,
                    men: 0,
                    women: 0,
                    youthBoys: 0,
                    youthGirls: 0,
                    childrenBoys: 0,
                    childrenGirls: 0,
                    year: 2022,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 4,
                    serviceType: 'house-caring',
                    district: "Rumuagholu 2",
                    month: "June",
                    week: 3,
                    men: 11,
                    women: 0,
                    youthBoys: 0,
                    youthGirls: 0,
                    childrenBoys: 0,
                    childrenGirls: 0,
                    year: 2022,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Add more sample data for other service types...
            ],
            addAttendance: (serviceType, data) => {
                const newAttendance: Attendance = {
                    id: Date.now(),
                    serviceType,
                    district: data.district,
                    month: data.month,
                    week: parseInt(data.week),
                    men: data.men,
                    women: data.women,
                    youthBoys: data.youthBoys,
                    youthGirls: data.youthGirls,
                    childrenBoys: data.childrenBoys,
                    childrenGirls: data.childrenGirls,
                    year: parseInt(data.year),
                    state: data.state,
                    region: data.region,
                    group: data.group,
                    oldGroup: data.oldGroup,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ attendances: [...state.attendances, newAttendance] }));
            },
            updateAttendance: (id, data) => {
                set((state) => ({
                    attendances: state.attendances.map((attendance) => {
                        if (attendance.id === id) {
                            return {
                                ...attendance,
                                ...data,
                                week: data.week ? parseInt(data.week) : attendance.week,
                                year: data.year ? parseInt(data.year) : attendance.year,
                                updatedAt: new Date(),
                            };
                        }
                        return attendance;
                    }),
                }));
            },
            deleteAttendance: (id) => {
                set((state) => ({
                    attendances: state.attendances.filter((attendance) => attendance.id !== id),
                }));
            },
            setAttendances: (attendances) => {
                set({ attendances });
            },
            getAttendancesByServiceType: (serviceType) => {
                return get().attendances.filter(attendance => attendance.serviceType === serviceType);
            },
        }),
        {
            name: 'attendance-storage',
        }
    )
);

// Service type configurations
export const SERVICE_TYPES = {
    'sunday-worship': {
        name: 'Sunday Worship Service',
        storageKey: 'sunday-worship-attendance',
    },
    'search-scriptures': {
        name: 'Search The Scriptures',
        storageKey: 'search-scriptures-attendance',
    },
    'house-caring': {
        name: 'House Caring Fellowship',
        storageKey: 'house-caring-attendance',
    },
    'thursday-revival': {
        name: 'Thursday Revival & ETS',
        storageKey: 'thursday-revival-attendance',
    },
    'monday-bible': {
        name: 'Monday Bible Study',
        storageKey: 'monday-bible-attendance',
    },
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;