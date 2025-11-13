// schemas/oldgroups.schema.ts
import { z } from 'zod'

export const oldGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    code: z.string().min(1, 'Group code is required'),
    leader: z.string().min(1, 'Group leader is required'),
    state_id: z.number().min(1, 'State ID is required'),
    region_id: z.number().min(1, 'Region ID is required'),
})

export type OldGroupFormData = z.infer<typeof oldGroupSchema>