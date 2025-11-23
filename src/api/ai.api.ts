import { axiosClient } from "@/config/axios.config"

export const aiApi = {
  summarize: async (payload: { source: string; rows: unknown[]; meta?: Record<string, unknown> }): Promise<string> => {
    const { data } = await axiosClient.post<{ summary: string }>("/ai/summarize", payload)
    return data?.summary || ""
  }
}