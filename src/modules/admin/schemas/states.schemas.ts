// schemas/states.schema.ts
import { z } from 'zod'

export const stateSchema = z.object({
    stateName: z.string().min(1, 'State name is required'),
    stateCode: z.string().min(2, 'State code must be at least 2 characters'),
    leader: z.string().min(1, 'Leader name is required'),
    leader_email: z.string().email('Invalid email address').optional().or(z.literal('')),
    leader_phone: z.string().optional(),
})

export type StateFormData = z.infer<typeof stateSchema>