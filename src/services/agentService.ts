import { api } from "@/lib/axios";
import { Agent, ApiResponse } from "@/types";

export const agentService = {
  getAll: () => api.get<ApiResponse<{ agents: Agent[]; total: number }>>("/agents"),
  create: (body: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<Agent>>("/agents", body),
  update: (id: string, body: { name?: string; email?: string; phone?: string; status?: string; password?: string }) =>
    api.patch<ApiResponse<Agent>>(`/agents/${id}`, body),
};
