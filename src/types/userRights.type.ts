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

export interface UserRight {
    id: number;
    userName: string;
    accessLevel: string;
    accessScope: string;
    stateName?: string;
    regionName?: string;
    groupName?: string;
    oldGroupName?: string;
    districtName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type Users = User[];
export type UserRights = UserRight[];
