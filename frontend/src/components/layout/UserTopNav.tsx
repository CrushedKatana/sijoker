"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn, formatRole, initials } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { IconChevronDown, IconGrid, IconLogout, IconUserCircle } from "@/components/ui/icons";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: IconGrid },
  { href: "/profile", label: "Profil Saya", icon: IconUserCircle },
];

export function UserTopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-white">
      <div className="border-b border-navy-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <Logo />
          </Link>
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-navy-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-bold leading-tight text-navy-950">{user.name}</span>
                  <span className="block text-xs leading-tight text-slate-500">{formatRole(user.role)}</span>
                </span>
                <IconChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-navy-100 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-status-danger hover:bg-status-danger-bg"
                    >
                      <IconLogout className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-b border-navy-100">
        <nav className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 border-b-2 py-4 text-sm font-semibold transition-colors",
                  active
                    ? "border-navy-600 text-navy-600"
                    : "border-transparent text-slate-500 hover:text-navy-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
