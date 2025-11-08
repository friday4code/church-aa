export interface User {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    is_active: boolean;
    roles: string[];
    access_level: string;
    region_id: number | null;
    state_id: number | null;
    district_id: number | null;
}

export interface LoginResponse {
    access_token: Tokens["access_token"];
    refresh_token: Tokens["refresh_token"];
    user: User;
}

export interface Tokens {
    access_token: string;
    refresh_token: string;
}