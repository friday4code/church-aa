// schemas/userRights.schema.ts
import { z } from 'zod';

export const userRightSchema = z.object({
    userId: z.string().min(1, 'User is required'),
    stateName: z.string().optional(),
    regionName: z.string().optional(),
    groupName: z.string().optional(),
    oldGroupName: z.string().optional(),
    districtName: z.string().optional(),
    accessLevel: z.string().min(1, 'Access level is required'),
});

export type UserRightFormData = z.infer<typeof userRightSchema>;