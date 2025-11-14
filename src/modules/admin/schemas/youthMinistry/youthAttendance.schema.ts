// schemas/youth-attendance.schema.ts
import { z } from 'zod';

export const youthAttendanceSchema = z.object({
    attendance_type: z.enum(['weekly', 'revival'], 'Attendance type must be weekly or revival'),
    state_id: z.number().min(1, 'State is required'),
    region_id: z.number().min(1, 'Region is required'),
    district_id: z.number().min(1, 'District is required'),
    group_id: z.number().min(1, 'Group is required'),
    old_group_id: z.number().optional(),
    year: z.number().min(2000, 'Year must be valid'),
    month: z.string().min(1, 'Month is required'),
    week: z.number().optional(),
    male: z.number().min(0, 'Male count must be >= 0'),
    female: z.number().min(0, 'Female count must be >= 0'),
    member_boys: z.number().min(0, 'Member boys count must be >= 0'),
    member_girls: z.number().min(0, 'Member girls count must be >= 0'),
    visitor_boys: z.number().min(0, 'Visitor boys count must be >= 0'),
    visitor_girls: z.number().min(0, 'Visitor girls count must be >= 0'),
    challenges: z.string().optional(),
    solutions: z.string().optional(),
    testimony: z.string().optional(),
    remarks: z.string().optional(),
});

export type YouthAttendanceFormData = z.infer<typeof youthAttendanceSchema>;
