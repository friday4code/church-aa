// schemas/attendance.schema.ts
import { z } from 'zod';

export const AttendanceSchema = z.object({
    state_id: z.number().min(1, 'State is required'),
    region_id: z.number().min(1, 'Region is required'),
    district_id: z.number().min(1, 'District is required'),
    group_id: z.number().min(1, 'Group is required'),
    old_group_id: z.number().nullable().optional(),
    service_type: z.string().min(1, 'Service type is required'),
    month: z.string().min(1, 'Month is required'),
    week: z.number().min(1, 'Week is required').max(5, 'Week must be between 1-5'),
    year: z.number().min(2000, 'Year must be valid').max(2100, 'Year must be valid'),
    men: z.number().min(0, 'Men count cannot be negative'),
    women: z.number().min(0, 'Women count cannot be negative'),
    youth_boys: z.number().min(0, 'Youth Boys count cannot be negative'),
    youth_girls: z.number().min(0, 'Youth Girls count cannot be negative'),
    children_boys: z.number().min(0, 'Children Boys count cannot be negative'),
    children_girls: z.number().min(0, 'Children Girls count cannot be negative'),
    new_comers: z.number().min(0, 'New Comers count cannot be negative').optional(),
    tithe_offering: z.number().min(0, 'Tithe Offering count cannot be negative').optional(),
});

export type AttendanceFormData = z.infer<typeof AttendanceSchema>;