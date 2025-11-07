// schemas/youth-attendance.schema.ts
import { z } from 'zod';

export const youthAttendanceSchema = z.object({
    stateName: z.string().min(1, 'State is required'),
    regionName: z.string().min(1, 'Region (LGA) is required'),
    oldGroupName: z.string().optional(),
    groupName: z.string().min(1, 'Group name is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required'),
    yhsfMale: z.number().min(0, 'YHSF Male must be a positive number'),
    yhsfFemale: z.number().min(0, 'YHSF Female must be a positive number'),
});

export type YouthAttendanceFormData = z.infer<typeof youthAttendanceSchema>;