import type { LoginResponse, Tokens, User } from "@/types/auth.type";

// Sample data examples:
export const sampleUser: User = {
    id: 1,
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    middle_name: "Michael",
    phone_number: "+1-555-0123",
    full_name: "John Michael Doe",
    avatar_url: "https://bit.ly/sage-adebayo",
    role: "user"
};

export const sampleAdminUser: User = {
    id: 2,
    email: "admin@example.com",
    first_name: "Jane",
    last_name: "Smith",
    middle_name: null,
    phone_number: "+1-555-0124",
    full_name: "Jane Smith",
    avatar_url: "https://bit.ly/sage-adebayo",
    role: "admin"
};

export const sampleTokens: Tokens = {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
};

export const sampleLoginResponse: LoginResponse = {
    user: sampleAdminUser,
    tokens: sampleTokens
};