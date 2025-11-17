// schemas/districts.schema.ts
import { z } from 'zod';

export const districtSchema = z.object({
    state_id: z.number().min(1, 'State is required'),
    region_id: z.number().min(1, 'Region (LGA) is required'),
    name: z.string().min(1, 'District name is required'),
    leader: z.string().min(1, 'District leader is required'),
    code: z.string().min(1, 'District code is required'),
    old_group_id: z.number().min(1, 'Old group must be selected'),
    group_id: z.number().min(1, 'Group must be selected'),
    old_group_name: z.string().optional(), // Temporary field for UI
    group_name: z.string().optional(), // Temporary field for UI
    state_name: z.string().optional(), // Temporary field for UI
    region_name: z.string().optional(), // Temporary field for UI
});

export type DistrictFormData = z.infer<typeof districtSchema>;