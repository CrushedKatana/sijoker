"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { CompanyReport, ReportStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Field, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { Modal } from "../_components/Modal";

const STATUS_OPTIONS: ReportStatus[] = ["pending", "proses", "selesai"];

export default function PelaporanPerusahaanPage() {
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [detail, setDetail] = useState<CompanyReport | null>(null);
  const [statusDraft, setStatusDraft] = useState<ReportStatus>("pending");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    api
      .get<CompanyReport[]>(`/api/company-reports${qs}`)
      .then(setReports)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat laporan"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  function openDetail(report: CompanyReport) {
    setDetail(report);
    setStatusDraft(report.status);
  }

  async function handleUpdateStatus() {
    if (!detail) return;
    setSaving(true);
    try {
      await api.patch<CompanyReport>(`/api/company-reports/${detail.id}`, { status: statusDraft });
      setDetail(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal memperbarui status");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    downloadCsv(
      "pelaporan-perusahaan.csv",
      ["Perusahaan", "Periode", "Tgl Lapor", "Tenaga Kerja", "Status"],
      reports.map((r) => [r.company_name ?? "-", r.period, formatDate(r.submitted_at), r.total_count, r.status])
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-950">Manajemen Pelaporan Perusahaan</h1>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-48">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="outline" className="!border-status-success/40 !text-status-success" onClick={exportCsv}>
            Export Excel
          </Button>
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat...</p>
        ) : reports.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Belum ada laporan" description="Laporan tenaga kerja dari perusahaan akan muncul di sini." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-4 font-semibold">Perusahaan</th>
                  <th className="px-6 py-4 font-semibold">Periode</th>
                  <th className="px-6 py-4 font-semibold">Tgl. Lapor</th>
                  <th className="px-6 py-4 font-semibold">Tenaga Kerja</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-navy-50 last:border-0">
                    <td className="px-6 py-4 font-semibold text-navy-950">{r.company_name ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-600">{r.period}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(r.submitted_at)}</td>
                    <td className="px-6 py-4 font-semibold text-navy-600">{r.total_count} orang</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} label={r.status[0].toUpperCase() + r.status.slice(1)} />
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => openDetail(r)} className="font-semibold text-navy-600 hover:underline">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {detail && (
        <Modal title={`Laporan ${detail.company_name ?? ""}`} onClose={() => setDetail(null)}>
          <div className="space-y-3 text-sm">
            <Row label="Perusahaan" value={detail.company_name ?? "-"} />
            <Row label="Periode" value={detail.period} />
            <Row label="Tanggal Lapor" value={formatDate(detail.submitted_at)} />
            <Row label="Sektor" value={detail.sector ?? "-"} />
            <Row label="Kota" value={detail.city ?? "-"} />
            <Row label="NPWP" value={detail.npwp ?? "-"} />
            <Row label="NIB" value={detail.nib ?? "-"} />
            <Row label="Tenaga Kerja Laki-laki" value={String(detail.male_count)} />
            <Row label="Tenaga Kerja Perempuan" value={String(detail.female_count)} />
            <Row label="Total Tenaga Kerja" value={String(detail.total_count)} />
          </div>

          <div className="mt-5 border-t border-navy-100 pt-4">
            <Field label="Ubah Status">
              <Select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value as ReportStatus)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDetail(null)}>
                Tutup
              </Button>
              <Button onClick={handleUpdateStatus} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Status"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
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
