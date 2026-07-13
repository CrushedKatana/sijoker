import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            A unified employment services platform connecting job seekers, employers, and the
            local workforce office.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-brand-orange-500">Layanan</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/pelatihan" className="hover:text-white">Pelatihan</Link></li>
            <li><Link href="/pengaduan" className="hover:text-white">Pengaduan</Link></li>
            <li><Link href="/survei" className="hover:text-white">Survei Kepuasan</Link></li>
            <li><Link href="/berita" className="hover:text-white">Berita</Link></li>
            <li><Link href="/loker" className="hover:text-white">Info Loker</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-brand-orange-500">Kontak</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>Jl. Panglima Sudirman No.507, Kota Batu, Jawa Timur 65311</li>
            <li>(0341) 512-345</li>
            <li>layanan@example.gov</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Local Workforce Office. All rights reserved.
      </div>
    </footer>
  );
}
