export interface User {
    access_level: string;
    district_id: number | null;
    email: string;
    id: number;
    is_active: boolean;
    name: string;
    phone: string | null;
    region_id: number | null;
    roles: string[];
    state_id: number | null;
}

export type Users = User[];