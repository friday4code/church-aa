// schemas/regions.schemas.ts
import { z } from 'zod';

export const regionSchema = z.object({
    regionName: z.string().min(1, 'Region name is required'),
    stateName: z.string().min(1, 'State name is required'),
    leader: z.string().min(1, 'Region leader is required'),
});

export type RegionFormData = z.infer<typeof regionSchema>;