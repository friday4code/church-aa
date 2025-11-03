// schemas/groups.schema.ts
import { z } from 'zod';

export const groupSchema = z.object({
    stateName: z.string().min(5, 'State is required'),
    regionName: z.string().min(5, 'Region (LGA) is required'),
    groupName: z.string().min(4, 'Group name is required'),
    oldGroupName: z.string().min(5, "Old group name is required"),
    leader: z.string().min(5, 'Leader is required'),
});

export type GroupFormData = z.infer<typeof groupSchema>;