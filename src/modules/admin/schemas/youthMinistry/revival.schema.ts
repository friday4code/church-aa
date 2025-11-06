// schemas/youth-revival-attendance.schema.ts
import { z } from 'zod';

export const youthRevivalAttendanceSchema = z.object({
    period: z.string().min(1, 'Period is required'),
    male: z.number().min(0, 'Male count must be 0 or greater'),
    female: z.number().min(0, 'Female count must be 0 or greater'),
    testimony: z.string().optional(),
    challenges: z.string().optional(),
    solutions: z.string().optional(),
    remarks: z.string().optional(),
});

export type YouthRevivalAttendanceFormData = z.infer<typeof youthRevivalAttendanceSchema>;