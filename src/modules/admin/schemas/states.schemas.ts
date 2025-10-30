// schemas/states.schema.ts
import { z } from 'zod'

export const stateSchema = z.object({
    stateName: z.string().min(1, 'State name is required'),
    stateCode: z.string().min(2, 'State code must be at least 2 characters').max(5),
    leader: z.string().min(1, 'Leader name is required'),
})

export type StateFormData = z.infer<typeof stateSchema>