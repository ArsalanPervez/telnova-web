"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SweetAlert from "@/components/ui/SweetAlert";

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void }[];
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      showAlert("error", "Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("error", "Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      showAlert("error", "Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real API call
      // const data = await authAPI.register({ name, email, password, phone });
      showAlert("success", "Success", "Account created successfully", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);
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
        <div className="mb-5 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
          <p className="text-sm text-gray-500">Sign up to get started</p>
        </div>

        {/* Form */}
        <div className="mb-3 flex flex-col gap-3">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

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
              autoComplete="email"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
              Phone
            </label>
            <input
              type="tel"
              className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-white text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-70 mb-4"
          style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-xs font-medium text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Login Link */}
        <div className="flex justify-center items-center gap-1">
          <span className="text-sm text-gray-600">Already have an account?</span>
          <Link href="/login" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
            Sign In
          </Link>
        </div>
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
