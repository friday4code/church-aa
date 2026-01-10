// schemas/group.schema.ts
import { z } from "zod";

export const groupSchema = z.object({
    group_name: z.string().min(1, "Group name is required"),
    leader: z.string().min(1, "Group leader is required"),
    state_id: z.number().min(1, "State is required"),
    region_id: z.number().min(1, "Region is required"),
    old_group_id: z.number().optional(),
    old_group_name: z.string().optional(), // Temporary field for UI, not sent to API
    code: z.string().min(1, "Group code is required"),
    leader_email: z.email("Invalid email").optional(),
    leader_phone: z.string().optional()
});

export type GroupFormData = z.infer<typeof groupSchema>;