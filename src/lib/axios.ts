import axios from "axios";
import { getToken, clearToken } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to prevent multiple 401 handlers from firing at once
let isLoggingOut = false;

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      // Clear all auth state
      clearToken();
      try {
        localStorage.removeItem("app-store");
      } catch {
        // ignore
      }

      // Use replace so the user can't go "back" to the broken page
      window.location.replace("/login");
    }
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
