// // schemas/users.schema.ts
// import { z } from 'zod';

// // This is for form data (what comes from the form)
// export const userFormSchema = (mode: string) => z.object({
//     name: z.string().min(1, 'Full name is required'),
//     email: z.string().min(1, 'Email is required').email('Invalid email format'),
//     phone: z.string().min(1, 'Phone number is required'),
//     password: mode === 'add' 
//         ? z.string().min(6, 'Password must be at least 6 characters')
//         : z.string().optional(),
//     state_id: z.number().optional().default(0),
//     region_id: z.number().optional().default(0),
//     district_id: z.number().optional().default(0),
//     group_id: z.number().optional().default(0),
//     old_group_id: z.number().optional().default(0),
//     role_ids: z.array(z.number()).min(1, "At least one role is required")
// });

// // This is for API payload (what gets sent to backend)
// export const userApiSchema = z.object({
//     name: z.string(),
//     email: z.string(),
//     phone: z.string(),
//     password: z.string().optional(),
//     role_id: z.number(),
//     state_id: z.number().optional(),
//     region_id: z.number().optional(),
//     district_id: z.number().optional(),
//     group_id: z.number().optional(),
//     old_group_id: z.number().optional(),
// });

// export type UserFormData = z.infer<ReturnType<typeof userFormSchema>>;
// export type UserApiPayload = z.infer<typeof userApiSchema>;







import { z } from 'zod';

export const userSchema = (mode: string) => z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required'),
    phone: z.string().optional(),
    password: z.string().min(mode === 'add' ? 6 : 0, 'Password must be at least 6 characters').optional(),
    state_id: mode === 'add' ? z.number().min(1, 'State is required') : z.number().optional(),
    region_id: mode === 'add' ? z.number().min(1, 'Region is required') : z.number().optional(),
    district_id: z.number().optional(),
    group_id: z.number().optional().default(0),
    old_group_id: z.number().optional().default(0),
    // roles: z.array(z.union([z.string(), z.number()]))
    role_ids: z.array(z.number()).min(1, "At least one role is required"),
    role_id: z.array(z.number()).min(1, "At least one role is required")

}).refine((data) => {
    // For add mode, password is required
    if (mode === 'add') {
        return !!data.password && data.password.length >= 6;
    }
    return true;
});

export type UserFormData = z.infer<ReturnType<typeof userSchema>>;