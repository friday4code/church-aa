import type { LoginFormData } from "@/modules/auth/pages/Login"
import { axiosClient } from "../config/axios.config"
import { useAuthStore } from "@/store/auth.store"
import type { RefereeFormData } from "@/modules/auth/pages/RefereeForm"
import type { LoginResponse } from "@/types/auth.type"
import { sampleLoginResponse } from "@/mock/user.mock"
import { delay } from "@/utils/helpers"

export const authApi = {
    login: async (credentials: LoginFormData): Promise<LoginResponse> => {
        // await delay(2000);
        const { data } = await axiosClient.post<LoginResponse>("/auth/login", credentials);
        return data;
    },

    register: async (registerData: Record<string, string | Record<string, string>>): Promise<LoginResponse> => {
        const { data } = await axiosClient.post<LoginResponse>("/users", registerData)
        return data
    },

    sendRefereeReport: async (report: RefereeFormData): Promise<any> => {
        const { data } = await axiosClient.post("/users", report)
        return data
    },

    logout: async (): Promise<void> => {
        await axiosClient.post("/auth/logout")
    },

    refreshToken: async (): Promise<{ accessToken: string }> => {
        const refreshToken = useAuthStore.getState().tokens?.refreshToken;
        const { data } = await axiosClient.post("/auth/refresh-token", { refreshToken })
        return data
    },

    requestPasswordReset: async (payload: { email: string }): Promise<{ status: boolean, message: string }> => {
        // const { data } = await axiosClient.post("/auth/forgot-password", payload);
        await delay(2000);
        return { status: true, message: "Password reset email sent successfully!" }
    },

    getCurrentUser: async () => {
        const { data } = await axiosClient.get("/users/me");
        return data;
    },
}
