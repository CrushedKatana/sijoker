"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn, initials } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import {
  BriefcaseIcon,
  BuildingIcon,
  ChevronDownIcon,
  DocEditIcon,
  GridIcon,
} from "@/components/ui/icons";

const tabs = [
  { href: "/perusahaan", label: "Dashboard", icon: GridIcon, exact: true },
  { href: "/perusahaan/laporan", label: "Buat Laporan", icon: DocEditIcon },
  { href: "/perusahaan/lowongan", label: "Lowongan", icon: BriefcaseIcon },
  { href: "/perusahaan/profil", label: "Profil Perusahaan", icon: BuildingIcon },
];

export function CompanyTopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/perusahaan">
          <Logo />
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-navy-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">
              {user ? initials(user.name) : ""}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold text-navy-950">{user?.name}</span>
              <span className="block text-xs text-slate-400">Akun Perusahaan</span>
            </span>
            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-navy-100 bg-white py-1 shadow-lg shadow-navy-950/10">
              <Link
                href="/perusahaan/profil"
                className="block px-4 py-2 text-sm text-navy-800 hover:bg-navy-50"
                onClick={() => setMenuOpen(false)}
              >
                Profil Perusahaan
              </Link>
              <button
                type="button"
                onClick={logout}
                className="block w-full px-4 py-2 text-left text-sm text-status-danger hover:bg-status-danger-bg"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center gap-8 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors",
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
    </header>
  );
}
