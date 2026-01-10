// schemas/region.schema.ts
import { z } from 'zod';

export const regionSchema = z.object({
    name: z.string().min(1, 'Region name is required'),
    state_id: z.number().min(1, 'State is required'),
    leader: z.string().min(1, 'Region leader is required'),
    code: z.string().min(1, 'Region code is required'),
    leader_email: z.string().email('Invalid email address'),
    leader_phone: z.string().min(1, 'Region leader phone is required'),
});

export type RegionFormData = z.infer<typeof regionSchema>;