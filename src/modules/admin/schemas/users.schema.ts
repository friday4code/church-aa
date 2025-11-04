// schemas/users.schema.ts
import { z } from 'zod';

export const userSchema = (mode: string) => (z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email or username is required').email('Invalid email format'),
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(mode === 'add' ? 6 : 0, 'Password must be at least 6 characters').optional(),
}).refine((data) => {
    // For add mode, password is required
    if (mode === 'add') {
        return !!data.password && data.password.length >= 6;
    }
    return true;
}));

export type UserFormData = z.infer<ReturnType<typeof userSchema>>;