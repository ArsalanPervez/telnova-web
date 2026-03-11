"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // avoid firing if we've already navigated away from the base
    if (pathname !== "/dashboard") return;

    // wait for zustand hydration – user will be null until store rehydrates
    if (!user) return;

    const role = user.role?.toLowerCase();
    if (role === "admin") {
      router.replace("/dashboard/admin");
    } else if (role === "agent") {
      router.replace("/dashboard/agent");
    } else {
      router.replace("/login");
    }
  }, [user, router, pathname]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
