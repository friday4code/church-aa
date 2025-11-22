import type { LoginFormData } from "@/modules/auth/pages/Login"
import { axiosClient } from "../config/axios.config"
import { useAuthStore } from "@/store/auth.store"
import type { RefereeFormData } from "@/modules/auth/pages/RefereeForm"
import type { LoginResponse, GetCurrentUserResponse } from "@/types/auth.type"

export const authApi = {
    login: async (credentials: LoginFormData): Promise<LoginResponse> => {
        const { data } = await axiosClient.post<LoginResponse>("/auth/login", credentials);
        return data;
    },

    register: async (registerData: Record<string, string | Record<string, string>>): Promise<LoginResponse> => {
        const { data } = await axiosClient.post<LoginResponse>("/users", registerData)
        return data
    },

    sendRefereeReport: async (report: RefereeFormData): Promise<unknown> => {
        const { data } = await axiosClient.post<unknown>("/users", report)
        return data
    },

    logout: async (): Promise<void> => {
        await axiosClient.post("/auth/logout")
    },

    refreshToken: async (): Promise<{ accessToken: string }> => {
        const refreshToken = useAuthStore.getState().tokens?.refresh_token;
        const { data } = await axiosClient.post("/auth/refresh-token", { refreshToken })
        return data
    },

    requestPasswordReset: async (payload: { email: string }): Promise<{ status: boolean, message: string }> => {
        const { data } = await axiosClient.post("/auth/forgot-password", payload);
        // await delay(2000);
        // return { status: true, message: "Password reset email sent successfully!" }
        return data;
    },

    getCurrentUser: async (): Promise<GetCurrentUserResponse> => {
        const { data } = await axiosClient.get<GetCurrentUserResponse>("/auth/me");
        return data;
    },

    updateProfile: async (payload: Record<string, string>): Promise<{ status: boolean; message?: string }> => {
        const { data } = await axiosClient.put<{ status: boolean; message?: string }>("/profile", payload)
        return data
    },

    changePassword: async (payload: { current_password: string; new_password: string; confirm_new_password: string }): Promise<{ status: boolean; message?: string }> => {
        const { data } = await axiosClient.put<{ status: boolean; message?: string }>("/profile/change-password", payload)
        return data
    },
}
