"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SiapKerjaLink } from "@/components/layout/SiapKerjaLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LogoMark } from "@/components/ui/Logo";
import {
  BriefcaseIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  GraduationCapIcon,
  NewspaperIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";

const services: Array<{
  icon: React.ReactNode;
  accent: string;
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  external?: boolean;
}> = [
  {
    icon: <GraduationCapIcon className="h-6 w-6" />,
    accent: "border-t-navy-600 text-navy-600",
    title: "Pelatihan Kerja",
    description:
      "Tingkatkan kompetensi dan keahlian profesi Anda melalui program pelatihan bersertifikasi.",
    actionLabel: "Lihat Jadwal Kelas",
    href: "/pelatihan",
  },
  {
    icon: <ShieldIcon className="h-6 w-6" />,
    accent: "border-t-brand-orange-500 text-brand-orange-500",
    title: "Pusat Pengaduan",
    description:
      "Sampaikan keluhan, sengketa ketenagakerjaan, atau pelanggaran hak pekerja secara aman.",
    actionLabel: "Buat Laporan",
    href: "/pengaduan",
  },
  {
    icon: <BriefcaseIcon className="h-6 w-6" />,
    accent: "border-t-status-success text-status-success",
    title: "Siap Kerja (Link Direct)",
    description: "Akses langsung ekosistem penempatan tenaga kerja nasional terintegrasi Kemnaker RI.",
    actionLabel: "Buka Portal Eksternal",
    external: true,
  },
  {
    icon: <ClipboardIcon className="h-6 w-6" />,
    accent: "border-t-status-info text-status-info",
    title: "Survei Kepuasan Pelayanan",
    description: "Berikan penilaian dan masukan Anda untuk membantu kami meningkatkan kualitas layanan.",
    actionLabel: "Isi Survei",
    href: "/survei",
  },
  {
    icon: <NewspaperIcon className="h-6 w-6" />,
    accent: "border-t-status-danger text-status-danger",
    title: "Berita & Pengumuman",
    description: "Dapatkan informasi terkini mengenai kebijakan ketenagakerjaan dan agenda kegiatan.",
    actionLabel: "Baca Artikel Terbaru",
    href: "/berita",
  },
  {
    icon: <BriefcaseIcon className="h-6 w-6" />,
    accent: "border-t-status-warning text-status-warning",
    title: "Info Lowongan Kerja",
    description: "Eksplorasi ribuan peluang karir terverifikasi dari perusahaan mitra resmi.",
    actionLabel: "Cari Lowongan Aktif",
    href: "/loker",
  },
];

function ServiceCardBody({
  icon,
  accent,
  title,
  description,
  actionLabel,
  external,
}: (typeof services)[number]) {
  return (
    <Card className={`flex h-full flex-col gap-4 border-t-4 ${accent.split(" ")[0]} transition-shadow hover:shadow-md`}>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 ${accent.split(" ")[1]}`}>
        {icon}
      </span>
      <div>
        <h3 className="text-base font-bold text-navy-950">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500">{description}</p>
      </div>
      <div className="mt-auto border-t border-navy-100 pt-3">
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accent.split(" ")[1]}`}>
          {actionLabel}
          {external ? <ExternalLinkIcon className="h-4 w-4" /> : <span aria-hidden>→</span>}
        </span>
      </div>
    </Card>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/loker${params}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-navy-100 bg-gradient-to-br from-navy-50 via-white to-brand-orange-100/40">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">
                Satu Platform Terpadu untuk{" "}
                <span className="text-brand-orange-500">Layanan Ketenagakerjaan</span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-slate-600">
                Akses pelatihan kerja, informasi lowongan, pengaduan, hingga penempatan kerja
                nasional — semua layanan ketenagakerjaan dalam satu tempat.
              </p>
              <form
                onSubmit={handleSearch}
                className="mt-8 flex max-w-lg items-center gap-2 rounded-full border border-navy-100 bg-white p-1.5 shadow-sm"
              >
                <SearchIcon className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari layanan, pelatihan, atau loker..."
                  className="w-full bg-transparent px-1 py-2 text-sm text-navy-950 placeholder:text-slate-400 focus:outline-none"
                />
                <Button type="submit" variant="accent" size="md" className="shrink-0">
                  Cari
                </Button>
              </form>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white/60 shadow-inner sm:h-80 sm:w-80">
                <LogoMark className="h-32 w-32 sm:h-40 sm:w-40" />
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600">
              Layanan Kami
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-navy-950 sm:text-3xl">
              Layanan Utama Kami
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Akses cepat seluruh layanan ketenagakerjaan dari kantor Dinas Tenaga Kerja.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) =>
              service.external ? (
                <SiapKerjaLink key={service.title} className="block h-full">
                  <ServiceCardBody {...service} />
                </SiapKerjaLink>
              ) : (
                <Link key={service.title} href={service.href!} className="block h-full">
                  <ServiceCardBody {...service} />
                </Link>
              )
            )}
          </div>
        </section>

        {/* CTA banner */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-14 text-center sm:px-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-navy-700/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-navy-700/30" />
            <h2 className="relative text-2xl font-extrabold text-white sm:text-3xl">
              Siap Memulai Karir Anda?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm text-slate-300">
              Bergabunglah dengan ribuan pencari kerja yang telah mendapatkan manfaat dari layanan
              kami.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/loker" variant="accent" size="lg">
                Cari Lowongan Sekarang
              </Button>
              <Link
                href="/pelatihan"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Lihat Program Pelatihan
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
