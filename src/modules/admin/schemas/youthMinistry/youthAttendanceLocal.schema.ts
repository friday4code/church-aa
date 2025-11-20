import { z } from 'zod'

export const youthAttendanceLocalSchema = z.object({
    stateName: z.string().min(1, 'State is required'),
    regionName: z.string().min(1, 'Region is required'),
    oldGroupName: z.string().optional(),
    groupName: z.string().min(1, 'Group is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required'),
    yhsfMale: z.number().min(0, 'YHSF Male cannot be negative'),
    yhsfFemale: z.number().min(0, 'YHSF Female cannot be negative'),
})

export type YouthAttendanceLocalFormData = z.infer<typeof youthAttendanceLocalSchema>

