"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SweetAlert from "@/components/ui/SweetAlert";
import { useAuth } from "@/hooks/useAuth";

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void }[];
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    type: "error",
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = (
    type: AlertState["type"],
    title: string,
    message: string,
    buttons: AlertState["buttons"] = [{ text: "OK" }]
  ) => {
    setAlert({ visible: true, type, title, message, buttons });
  };

  const hideAlert = () => setAlert((prev) => ({ ...prev, visible: false }));

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("error", "Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userData = await login(email, password);
      const role = userData.role?.toLowerCase();
      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else if (role === "agent") {
        router.replace("/dashboard/agent");
      } else {
        showAlert(
          "info",
          "Logged in",
          "Your account has logged in successfully, but you do not have access to the dashboard. Redirecting to home."
        );
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      showAlert("error", "Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[380px] bg-white/90 backdrop-blur-2xl p-6 shadow-2xl border border-white/50">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {/* Form */}
        <div className="mb-4 flex flex-col gap-3">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-white text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
          style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </div>

      <SweetAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </>
  );
}
