// stores/youth-attendance.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { YouthAttendanceFormData } from '../../schemas/youthMinistry/youthAttendance.schema';

export interface YouthAttendance {
    id: number;
    stateName: string;
    regionName: string;
    oldGroupName?: string;
    groupName: string;
    month: string;
    year: string;
    yhsfMale: number;
    yhsfFemale: number;
    createdAt: Date;
    updatedAt: Date;
}

interface YouthAttendanceStore {
    youthAttendance: YouthAttendance[];
    addYouthAttendance: (data: YouthAttendanceFormData) => void;
    updateYouthAttendance: (id: number, data: Partial<YouthAttendanceFormData>) => void;
    deleteYouthAttendance: (id: number) => void;
    setYouthAttendance: (youthAttendance: YouthAttendance[]) => void;
}

export const useYouthAttendanceStore = create<YouthAttendanceStore>()(
    persist(
        (set) => ({
            youthAttendance: [],
            addYouthAttendance: (data) => {
                const newYouthAttendance: YouthAttendance = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ youthAttendance: [...state.youthAttendance, newYouthAttendance] }));
            },
            updateYouthAttendance: (id, data) => {
                set((state) => ({
                    youthAttendance: state.youthAttendance.map((attendance) =>
                        attendance.id === id
                            ? { ...attendance, ...data, updatedAt: new Date() }
                            : attendance
                    ),
                }));
            },
            deleteYouthAttendance: (id) => {
                set((state) => ({
                    youthAttendance: state.youthAttendance.filter((attendance) => attendance.id !== id),
                }));
            },
            setYouthAttendance: (youthAttendance) => {
                set({ youthAttendance });
            },
        }),
        {
            name: 'youth-attendance-storage',
        }
    )
);