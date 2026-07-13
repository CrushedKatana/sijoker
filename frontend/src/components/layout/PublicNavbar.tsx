"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SiapKerjaLink } from "@/components/layout/SiapKerjaLink";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { formatRole, initials } from "@/lib/utils";

const linksBeforeSiapKerja = [
  { href: "/pelatihan", label: "Pelatihan" },
  { href: "/pengaduan", label: "Pengaduan" },
];

const linksAfterSiapKerja = [
  { href: "/survei", label: "Survei Kepuasan" },
  { href: "/berita", label: "Berita" },
  { href: "/loker", label: "Info Loker" },
];

const roleHome: Record<string, string> = {
  admin: "/admin",
  operator: "/admin",
  pencari_kerja: "/dashboard",
  perusahaan: "/perusahaan",
};

export function PublicNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-navy-700 md:flex">
          {linksBeforeSiapKerja.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-navy-950">
              {link.label}
            </Link>
          ))}
          <SiapKerjaLink className="inline-flex items-center gap-1 hover:text-navy-950">
            Siap Kerja
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </SiapKerjaLink>
          {linksAfterSiapKerja.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-navy-950">
              {link.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href={roleHome[user.role] ?? "/"}
              className="hidden items-center gap-2 sm:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">
                {initials(user.name)}
              </span>
              <span className="text-sm font-semibold text-navy-950">{user.name}</span>
              <span className="text-xs text-slate-400">({formatRole(user.role)})</span>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              Keluar
            </Button>
          </div>
        ) : (
          <Button href="/login" size="sm">
            Masuk / Daftar
          </Button>
        )}
      </div>
    </header>
  );
}
