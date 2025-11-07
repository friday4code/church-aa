export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    phone_number: string;
    full_name: string;
    avatar_url:string;
    role: "user" | "admin"
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: User;
    tokens: Tokens;
}