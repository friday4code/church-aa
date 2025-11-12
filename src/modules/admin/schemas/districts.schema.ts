// schemas/districts.schema.ts
import { z } from 'zod';

export const districtSchema = z.object({
    state: z.string().min(1, 'State is required'),
    region: z.string().min(1, 'Region (LGA) is required'),
    name: z.string().min(1, 'District name is required'),
    leader: z.string().min(1, 'District leader is required'),
    code: z.string().optional(), // Optional since it might be auto-generated
});

export type DistrictFormData = z.infer<typeof districtSchema>;