// schemas/oldGroups.schemas.ts
import { z } from 'zod';

export const oldGroupSchema = z.object({
    stateName: z.string().min(1, 'State name is required'),
    regionName: z.string().min(1, 'Region name is required'),
    groupName: z.string().min(1, 'Group name is required'),
    leader: z.string().min(5,"Group leader is required"),
});

export type OldGroupFormData = z.infer<typeof oldGroupSchema>;