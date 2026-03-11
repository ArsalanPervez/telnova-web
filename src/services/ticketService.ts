import { api } from "@/lib/axios";
import { Ticket, ApiResponse } from "@/types";

export const ticketService = {
  getAll: (params?: { status?: string; type?: string; priority?: number; agentId?: string; userId?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ tickets: Ticket[]; total: number }>>("/tickets", { params }),
  getById: (id: string) => api.get<ApiResponse<Ticket>>(`/tickets/${id}`),
  create: (body: {
    type: string;
    subject: string;
    priority?: number;
    message?: string;
  }) => api.post<ApiResponse<Ticket>>("/tickets", body),
  assign: (id: string, agentId: string) =>
    api.patch<ApiResponse<Ticket>>(`/tickets/${id}/assign`, { agentId }),
  complete: (id: string) =>
    api.patch<ApiResponse<Ticket>>(`/tickets/${id}/complete`),
  getAssigned: () => api.get<ApiResponse<{ tickets: Ticket[]; total: number }>>("/tickets/assigned"),
};
