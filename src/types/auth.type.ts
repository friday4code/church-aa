export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    phone_number: string;
    full_name: string;
    is_active: boolean;
    last_login: string;
    metadata: UserMetadata;
    roles: Role[];
}

export interface UserMetadata {
    user_name: string;
    middle_name: string;
    [key: string]: any; // For any additional metadata fields
}

export interface Role {
    id: number;
    code: "applicant" | "student" | "super_admin" | string; // Added "applicant"
    name: string;
    scope_type: string;
    scope_id: number;
}

export interface Tenant {
    id: number;
    name: string;
    slug: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}