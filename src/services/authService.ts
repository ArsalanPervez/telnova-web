import { api } from "@/lib/axios";
import { User } from "@/types";

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export const authService = {
  login: (body: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", body),

  logout: () =>
    api.post("/auth/logout"),
};
