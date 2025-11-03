// schemas/districts.schema.ts
import { z } from 'zod';

export const districtSchema = z.object({
    stateName: z.string().min(1, 'State is required'),
    regionName: z.string().min(1, 'Region (LGA) is required'),
    oldGroupName: z.string().optional(),
    groupName: z.string().min(1, 'Group name is required'),
    districtName: z.string().min(1, 'District name is required'),
    leader: z.string().min(1, 'District leader is required'),
});

export type DistrictFormData = z.infer<typeof districtSchema>;