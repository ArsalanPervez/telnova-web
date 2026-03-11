"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: <GridIcon /> },
  { label: "Agents", href: "/dashboard/admin/agents", icon: <UsersIcon /> },
  { label: "Providers", href: "/dashboard/admin/providers", icon: <BuildingIcon /> },
  { label: "Tickets", href: "/dashboard/admin/tickets", icon: <DocumentIcon /> },
  { label: "FCC Upload", href: "/dashboard/admin/fcc-upload", icon: <UploadIcon /> },
];

const agentNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/agent", icon: <GridIcon /> },
  { label: "My Tickets", href: "/dashboard/agent/tickets", icon: <DocumentIcon /> },
];

export default function Sidebar() {
  const { user } = useAppStore();
  const { logout } = useAuth();
  const pathname = usePathname();

  let navItems: NavItem[] = [];
  if (user?.role === "admin") {
    navItems = adminNavItems;
  } else if (user?.role === "agent") {
    navItems = agentNavItems;
  }

  const isActive = (href: string) => {
    if (href === "/dashboard/admin" || href === "/dashboard/agent") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className="fixed left-0 top-0 h-screen bg-white shadow-lg flex flex-col z-30"
      style={{ width: "240px" }}
    >
      {/* Header */}
      <div
        className="px-5 py-5 flex flex-col gap-1"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        <span className="text-white font-bold text-lg tracking-wider">TELNOVA</span>
        {user && (
          <span className="text-white/80 text-xs truncate capitalize">Welcome, {user.name}</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className={active ? "text-indigo-600" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-gray-100 flex flex-col gap-1">
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            pathname === "/dashboard/profile"
              ? "bg-indigo-50 text-indigo-700 font-semibold"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          <span className={pathname === "/dashboard/profile" ? "text-indigo-600" : "text-gray-400"}>
            <UserIcon />
          </span>
          Profile
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <span className="text-gray-400">
            <LogoutIcon />
          </span>
          Logout
        </button>
      </div>
    </div>
  );
}
