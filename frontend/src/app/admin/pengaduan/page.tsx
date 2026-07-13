"use client";

import { useEffect, useState } from "react";
import { api, apiUrl, ApiError } from "@/lib/api";
import type { Complaint, ComplaintStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Field, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils";
import { Modal } from "../_components/Modal";

const URGENCY_LABEL: Record<string, string> = { rendah: "Rendah", sedang: "Sedang", tinggi: "Tinggi" };
const STATUS_LABEL: Record<string, string> = { pending: "Pending", diproses: "Diproses", selesai: "Selesai" };
const STATUS_OPTIONS: ComplaintStatus[] = ["pending", "diproses", "selesai"];

export default function PengaduanPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewing, setReviewing] = useState<Complaint | null>(null);
  const [statusDraft, setStatusDraft] = useState<ComplaintStatus>("pending");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      api.get<Complaint[]>("/api/complaints"),
      api.get<Record<string, number>>("/api/complaints/summary"),
    ])
      .then(([c, s]) => {
        setComplaints(c);
        setSummary(s);
      })
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat pengaduan"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openReview(c: Complaint) {
    setReviewing(c);
    setStatusDraft(c.status);
  }

  async function handleUpdate() {
    if (!reviewing) return;
    setSaving(true);
    try {
      await api.patch<Complaint>(`/api/complaints/${reviewing.id}`, { status: statusDraft });
      setReviewing(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal memperbarui pengaduan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-950">Kelola Pengaduan</h1>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatNumberCard value={summary?.pending ?? "-"} label="Pending" tone="text-status-danger" />
        <StatNumberCard value={summary?.diproses ?? "-"} label="Diproses" tone="text-status-warning" />
        <StatNumberCard value={summary?.selesai ?? "-"} label="Selesai" tone="text-status-success" />
      </div>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat...</p>
        ) : complaints.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Belum ada pengaduan" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-4 font-semibold">ID Tiket</th>
                  <th className="px-6 py-4 font-semibold">Pelapor</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Urgensi</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b border-navy-50 last:border-0">
                    <td className="px-6 py-4 font-semibold text-navy-600">{c.ticket_code}</td>
                    <td className="px-6 py-4 font-semibold text-navy-950">{c.full_name}</td>
                    <td className="px-6 py-4 text-slate-600">{c.category}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.urgency} label={URGENCY_LABEL[c.urgency]} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} label={STATUS_LABEL[c.status]} />
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => openReview(c)} className="font-semibold text-navy-600 hover:underline">
                        Tinjau
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {reviewing && (
        <Modal title={`Tinjau Pengaduan ${reviewing.ticket_code}`} onClose={() => setReviewing(null)}>
          <div className="space-y-3 text-sm">
            <Row label="Pelapor" value={reviewing.full_name} />
            <Row label="NIK" value={reviewing.nik ?? "-"} />
            <Row label="Kategori" value={reviewing.category} />
            <Row label="Urgensi" value={URGENCY_LABEL[reviewing.urgency]} />
            <Row label="Tanggal" value={formatDate(reviewing.created_at)} />
            <div>
              <p className="text-slate-500">Detail</p>
              <p className="mt-1 rounded-lg bg-navy-50/60 px-3 py-2 text-navy-900">{reviewing.detail}</p>
            </div>
            {reviewing.evidence_url && (
              <div>
                <p className="text-slate-500">Bukti</p>
                <a
                  href={apiUrl(reviewing.evidence_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block font-semibold text-navy-600 hover:underline"
                >
                  Lihat lampiran bukti
                </a>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-navy-100 pt-4">
            <Field label="Ubah Status">
              <Select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value as ComplaintStatus)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReviewing(null)}>
                Tutup
              </Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Status"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatNumberCard({ value, label, tone }: { value: number | string; tone: string; label: string }) {
  return (
    <Card className="items-center text-center">
      <p className={`text-4xl font-extrabold ${tone}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-navy-950">{value}</span>
    </div>
  );
}
