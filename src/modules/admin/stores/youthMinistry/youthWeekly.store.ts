export interface YouthWeeklyAttendance {
    id: number;
    youthAttId: number;
    period: string;
    membersBoys: number;
    visitorsBoys: number;
    membersGirls: number;
    visitorsGirls: number;
    year: number;
    month: number;
    week: number;
    createdAt: Date;
    updatedAt: Date;
}
