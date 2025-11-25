// export interface User {
//     id: number;
//     email: string;
//     name: string;
//     phone: string | null;
//     is_active: boolean;
//     roles: ("admin" | "Super Admin" | "State Admin" | "Region Admin" | "District Admin" | "Group Admin" | "Viewer")[];
//     access_level: string;
//     region_id: number | null;
//     state_id: number | null;
//     district_id: number | null;
// }

import type { User } from "./users.type";

export interface LoginResponse {
    access_token: Tokens["access_token"];
    refresh_token: Tokens["refresh_token"];
    user: User;
}

export interface Tokens {
    access_token: string;
    refresh_token: string;
}

export interface GetCurrentUserResponse {
    user: User;
}