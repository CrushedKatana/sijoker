"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Participant } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { initials } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";

export default function PesertaPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  function load(query: string) {
    setLoading(true);
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    api
      .get<Participant[]>(`/api/documents/participants${qs}`)
      .then(setParticipants)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat data peserta"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function exportCsv() {
    downloadCsv(
      "manajemen-peserta.csv",
      ["Nama", "Email", "No. Telepon", "Desa", "NIK"],
      participants.map((p) => [p.name, p.email, p.phone ?? "-", p.village ?? "-", p.nik ?? "-"])
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-950">Manajemen Peserta</h1>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input placeholder="Cari peserta..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md flex-1" />
          <Button variant="outline" className="!border-status-success/40 !text-status-success" onClick={exportCsv}>
            Export
          </Button>
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat...</p>
        ) : participants.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Belum ada peserta" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-4 font-semibold">Nama</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">No. Telepon</th>
                  <th className="px-6 py-4 font-semibold">Desa</th>
                  <th className="px-6 py-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-b border-navy-50 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">
                          {initials(p.name)}
                        </div>
                        <span className="font-semibold text-navy-950">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{p.email}</td>
                    <td className="px-6 py-4 text-slate-600">{p.phone ?? "-"}</td>
                    <td className="px-6 py-4">{p.village ? <Badge tone="info">{p.village}</Badge> : "-"}</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/dokumen-peserta/${p.id}`} className="font-semibold text-navy-600 hover:underline">
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
