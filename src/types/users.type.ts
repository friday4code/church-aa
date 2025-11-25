export interface User {
    access_level: string;
    district_id: number | null;
    group_id: number | null;
    old_group_id: number | null;
    email: string;
    id: number;
    is_active: boolean;
    name: string;
    phone: string | null;
    region_id: number | null;
    roles: ("admin" | "Super Admin" | "State Admin" | "Region Admin" | "District Admin" | "Group Admin" | "Viewer")[];
    state_id: number | null;
}

export type Users = User[];