// schemas/attendance/youthWeekly.schema.ts
import { z } from 'zod';

export const youthWeeklySchema = z.object({
    period: z.string().min(1, 'Period is required'),
    week: z.string().min(1, 'Week is required'),
    membersBoys: z.number().min(0, 'Members Boys count cannot be negative'),
    visitorsBoys: z.number().min(0, 'Visitors Boys count cannot be negative'),
    membersGirls: z.number().min(0, 'Members Girls count cannot be negative'),
    visitorsGirls: z.number().min(0, 'Visitors Girls count cannot be negative'),
    year: z.string().min(1, 'Year is required'),
    month: z.string().min(1, 'Month is required'),
});

export type YouthWeeklyFormData = z.infer<typeof youthWeeklySchema>;