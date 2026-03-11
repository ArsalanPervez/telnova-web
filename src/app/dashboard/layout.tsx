"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getToken } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check localStorage directly — more reliable than waiting for zustand hydration
    const token = getToken();
    if (!token) {
      window.location.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, []);

  // Show spinner until we've confirmed there's a token AND zustand has hydrated
  if (!authChecked || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6" style={{ marginLeft: "240px" }}>
        {children}
      </main>
    </div>
  );
}
