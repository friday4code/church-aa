import { z } from 'zod';

export const userSchema = (mode: string) => z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(mode === 'add' ? 6 : 0, 'Password must be at least 6 characters').optional(),
    state_id: mode === 'add' ? z.number().min(1, 'State is required') : z.number().optional(),
    region_id: mode === 'add' ? z.number().min(1, 'Region is required') : z.number().optional(),
    district_id: mode === 'add' ? z.number().min(1, 'District is required') : z.number().optional(),
    group_id: z.number().optional().default(0),
    old_group_id: z.number().optional().default(0),
    roles: z.array(z.union([z.number(), z.string()])).optional().default([1])
}).refine((data) => {
    // For add mode, password is required
    if (mode === 'add') {
        return !!data.password && data.password.length >= 6;
    }
    return true;
});

export type UserFormData = z.infer<ReturnType<typeof userSchema>>;