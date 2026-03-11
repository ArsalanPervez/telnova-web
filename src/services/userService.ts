import { api } from "@/lib/axios";
import { User, ApiResponse } from "@/types";

export const userService = {
  updateProfile: (body: { name?: string; phone?: string; password?: string; currentPassword?: string }) =>
    api.patch<ApiResponse<User>>("/users/profile", body),
  updateUser: (id: string, body: { name?: string; email?: string; phone?: string; password?: string; status?: string; role?: string; tier?: string }) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, body),
};
