// stores/youth-revival-attendance.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { YouthRevivalAttendanceFormData } from '../../schemas/youthMinistry/revival.schema';

export interface YouthRevivalAttendance {
    id: number;
    period: string;
    male: number;
    female: number;
    testimony: string;
    challenges: string;
    solutions: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
}

interface YouthRevivalAttendanceStore {
    youthRevivalAttendances: YouthRevivalAttendance[];
    addAttendance: (data: YouthRevivalAttendanceFormData) => void;
    updateAttendance: (id: number, data: Partial<YouthRevivalAttendanceFormData>) => void;
    deleteAttendance: (id: number) => void;
    setAttendances: (attendances: YouthRevivalAttendance[]) => void;
}

export const useYouthRevivalAttendanceStore = create<YouthRevivalAttendanceStore>()(
    persist(
        (set) => ({
            youthRevivalAttendances: [],
            addAttendance: (data) => {
                const newAttendance: YouthRevivalAttendance = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ youthRevivalAttendances: [...state.youthRevivalAttendances, newAttendance] }));
            },
            updateAttendance: (id, data) => {
                set((state) => ({
                    youthRevivalAttendances: state.youthRevivalAttendances.map((attendance) =>
                        attendance.id === id
                            ? { ...attendance, ...data, updatedAt: new Date() }
                            : attendance
                    ),
                }));
            },
            deleteAttendance: (id) => {
                set((state) => ({
                    youthRevivalAttendances: state.youthRevivalAttendances.filter((attendance) => attendance.id !== id),
                }));
            },
            setAttendances: (attendances) => {
                set({ youthRevivalAttendances: attendances });
            },
        }),
        {
            name: 'youth-revival-attendance-storage',
        }
    )
);