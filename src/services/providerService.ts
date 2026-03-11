import { api } from "@/lib/axios";
import { Provider, ApiResponse } from "@/types";

export const providerService = {
  getAll: () => api.get<ApiResponse<Provider[]>>("/providers"),
  create: (body: { name: string; website?: string; contactEmail?: string; contactPhone?: string }) =>
    api.post<ApiResponse<Provider>>("/providers", body),
};
