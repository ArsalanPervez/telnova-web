import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "@/types";

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
        clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: "app-store",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
