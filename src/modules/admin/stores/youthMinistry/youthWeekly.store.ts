// stores/attendance/youthWeekly.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { YouthWeeklyFormData } from '../../schemas/youthMinistry/youthWeekly.schema';

export interface YouthWeeklyAttendance {
    id: number;
    youthAttId: number;
    period: string;
    membersBoys: number;
    visitorsBoys: number;
    membersGirls: number;
    visitorsGirls: number;
    year: string;
    month: string;
    week: string;
    createdAt: Date;
    updatedAt: Date;
}

interface YouthWeeklyStore {
    attendances: YouthWeeklyAttendance[];
    addAttendance: (data: YouthWeeklyFormData) => void;
    updateAttendance: (id: number, data: Partial<YouthWeeklyFormData>) => void;
    deleteAttendance: (id: number) => void;
    setAttendances: (attendances: YouthWeeklyAttendance[]) => void;
}

export const useYouthWeeklyStore = create<YouthWeeklyStore>()(
    persist(
        (set) => ({
            attendances: [
                {
                    id: 1,
                    youthAttId: 3,
                    period: "2020, November - Week 1 Campus",
                    membersBoys: 12,
                    visitorsBoys: 2,
                    membersGirls: 14,
                    visitorsGirls: 12,
                    year: "2020",
                    month: "November",
                    week: "1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    youthAttId: 5,
                    period: "2020, December - Week 2 Campus",
                    membersBoys: 2,
                    visitorsBoys: 33,
                    membersGirls: 33,
                    visitorsGirls: 3,
                    year: "2020",
                    month: "December",
                    week: "2",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 3,
                    youthAttId: 6,
                    period: "2020, January - Week 1 Campus",
                    membersBoys: 12,
                    visitorsBoys: 12,
                    membersGirls: 12,
                    visitorsGirls: 12,
                    year: "2020",
                    month: "January",
                    week: "1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 4,
                    youthAttId: 7,
                    period: "2020, January - Week 1 Igbo",
                    membersBoys: 23,
                    visitorsBoys: 24,
                    membersGirls: 25,
                    visitorsGirls: 25,
                    year: "2020",
                    month: "January",
                    week: "1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 5,
                    youthAttId: 8,
                    period: "2020, August - Week 2",
                    membersBoys: 23,
                    visitorsBoys: 56,
                    membersGirls: 0,
                    visitorsGirls: 0,
                    year: "2020",
                    month: "August",
                    week: "2",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ],
            addAttendance: (data) => {
                const newAttendance: YouthWeeklyAttendance = {
                    id: Date.now(),
                    youthAttId: Math.floor(Math.random() * 1000) + 1,
                    period: `${data.year}, ${data.month} - Week ${data.week}`,
                    membersBoys: data.membersBoys,
                    visitorsBoys: data.visitorsBoys,
                    membersGirls: data.membersGirls,
                    visitorsGirls: data.visitorsGirls,
                    year: data.year,
                    month: data.month,
                    week: data.week,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ attendances: [...state.attendances, newAttendance] }));
            },
            updateAttendance: (id, data) => {
                set((state) => ({
                    attendances: state.attendances.map((attendance) => {
                        if (attendance.id === id) {
                            const updatedData = {
                                ...attendance,
                                ...data,
                                period: data.year && data.month && data.week
                                    ? `${data.year}, ${data.month} - Week ${data.week}`
                                    : attendance.period,
                                updatedAt: new Date(),
                            };
                            return updatedData;
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
        }),
        {
            name: 'youth-weekly-attendance-storage',
        }
    )
);