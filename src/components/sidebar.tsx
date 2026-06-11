"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  LayoutDashboard,
  Store,
  BarChart3,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "My Stores", icon: Store },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminItems = [
  { href: "/admin", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/users", label: "Users", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border-r border-white/5",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">StoreForge</span>
              <span className="block text-[10px] text-indigo-400 font-medium -mt-0.5">AI Platform</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white shadow-lg shadow-indigo-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-indigo-400")} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}

        {user?.role === "ADMIN" && (
          <>
            <div className="pt-4 pb-2 px-3">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
              )}
            </div>
            {adminItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-red-500/20 to-orange-500/10 text-white shadow-lg shadow-red-500/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-red-400")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && user?.subscription?.plan === "FREE" && (
        <div className="mx-3 mb-3">
          <Link href="/dashboard/billing">
            <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-bold text-white">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-white/70">Unlock all AI agents and premium features.</p>
            </div>
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-white/5 p-3 space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-gray-400 hover:text-white hover:bg-white/5"
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
