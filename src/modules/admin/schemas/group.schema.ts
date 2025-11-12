// schemas/group.schema.ts
import { z } from "zod";

export const groupSchema = z.object({
    group_name: z.string().min(1, "Group name is required"),
    leader: z.string().min(1, "Group leader is required"),
    access_level: z.string().min(1, "Access level is required"),
    state_id: z.number().min(1, "State is required"),
    region_id: z.number().min(1, "Region is required"),
    district_id: z.number().min(1, "District is required"),
});

export type GroupFormData = z.infer<typeof groupSchema>;