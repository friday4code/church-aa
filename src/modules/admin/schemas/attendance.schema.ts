import { z } from 'zod';

export const AttendanceSchema = z.object({
    state: z.string().min(1, 'State is required'),
    region: z.string().min(1, 'Region is required'),
    group: z.string().min(1, 'Group is required'),
    oldGroup: z.string().optional(),
    district: z.string().min(1, 'District is required'),
    month: z.string().min(1, 'Month is required'),
    week: z.string().min(1, 'Week is required'),
    year: z.string().min(1, 'Year is required'),
    men: z.number().min(0, 'Men count cannot be negative'),
    women: z.number().min(0, 'Women count cannot be negative'),
    youthBoys: z.number().min(0, 'Youth Boys count cannot be negative'),
    youthGirls: z.number().min(0, 'Youth Girls count cannot be negative'),
    childrenBoys: z.number().min(0, 'Children Boys count cannot be negative'),
    childrenGirls: z.number().min(0, 'Children Girls count cannot be negative')
});

export type AttendanceFormData = z.infer<typeof AttendanceSchema>;