"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn, formatRole, initials } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardShell({
  navItems,
  panelLabel,
  children,
}: {
  navItems: NavItem[];
  panelLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Pick the single best-matching nav item (longest href match) so a root item
  // like "/admin" doesn't stay highlighted on every nested route.
  const activeHref = navItems
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname?.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-900 px-4 py-6 text-slate-200 lg:flex">
        <div className="mb-6 px-2">
          <Logo variant="light" tagline={panelLabel} />
        </div>
        {user && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{formatRole(user.role)}</p>
            </div>
          </div>
        )}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-navy-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="h-5 w-5 shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-4 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          Keluar
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-navy-100 bg-white px-6 py-4">
          <input
            type="search"
            placeholder="Cari..."
            className="hidden w-full max-w-md rounded-full border border-navy-100 bg-navy-50 px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none sm:block"
          />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">
                  {initials(user.name)}
                </div>
                <span className="hidden text-sm font-semibold text-navy-950 sm:block">{user.name}</span>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
