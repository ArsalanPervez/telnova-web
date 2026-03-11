import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/services/authService";
import { setToken, clearToken } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAppStore();

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { user: userData, token: authToken } = res.data.data;

    // Normalize role to lowercase so comparisons are consistent
    const normalizedUser = {
      ...userData,
      role: userData.role?.toLowerCase() as typeof userData.role,
    };

    setToken(authToken);
    setAuth(normalizedUser, authToken);
    return normalizedUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // proceed with local logout even if server call fails
    }
    clearToken();
    clearAuth();
    router.push("/login");
  };

  return { user, token, isAuthenticated, login, logout };
}
