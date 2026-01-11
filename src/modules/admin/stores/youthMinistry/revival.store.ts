export interface YouthRevivalAttendance {
    id: number;
    period: string;
    male: number;
    female: number;
    testimony?: string;
    challenges?: string;
    solutions?: string;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}
