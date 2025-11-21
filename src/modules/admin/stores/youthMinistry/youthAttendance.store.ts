// stores/youth-attendance.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { YouthAttendanceLocalFormData } from '../../schemas/youthMinistry/youthAttendanceLocal.schema';

export interface YouthAttendance extends YouthAttendanceLocalFormData {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

interface YouthAttendanceStore {
    youthAttendance: YouthAttendance[];
    addYouthAttendance: (data: YouthAttendanceLocalFormData) => void;
    updateYouthAttendance: (id: number, data: Partial<YouthAttendanceLocalFormData>) => void;
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