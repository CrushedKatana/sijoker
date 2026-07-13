"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { CompanyProfile, CompanyReport } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/StatCard";
import { formatDateTime } from "@/lib/utils";
import { BuildingIcon, SendIcon, UsersIcon } from "@/components/ui/icons";

function currentQuarter() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `Q${quarter} ${now.getFullYear()}`;
}

interface ReportForm {
  period: string;
  company_name: string;
  npwp: string;
  nib: string;
  city: string;
  postal_code: string;
  sector: string;
  male_count: string;
  female_count: string;
}

const emptyForm: ReportForm = {
  period: currentQuarter(),
  company_name: "",
  npwp: "",
  nib: "",
  city: "",
  postal_code: "",
  sector: "",
  male_count: "0",
  female_count: "0",
};

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Menunggu",
    proses: "Diproses",
    selesai: "Selesai",
  };
  return map[status] ?? status;
}

export default function CompanyReportPage() {
  const [form, setForm] = useState<ReportForm>(emptyForm);
  const [history, setHistory] = useState<CompanyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"draft" | "submit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profile, reports] = await Promise.all([
          api.get<CompanyProfile>("/api/users/me/company-profile"),
          api.get<CompanyReport[]>("/api/company-reports/mine"),
        ]);
        if (cancelled) return;
        setForm((prev) => ({
          ...prev,
          company_name: profile.company_name ?? "",
          npwp: profile.npwp ?? "",
          nib: profile.nib ?? "",
          city: profile.city ?? "",
          postal_code: profile.postal_code ?? "",
          sector: profile.sector ?? "",
        }));
        setHistory(reports);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat data laporan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof ReportForm>(key: K, value: ReportForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const total = (Number(form.male_count) || 0) + (Number(form.female_count) || 0);

  async function handleSubmit(mode: "draft" | "submit") {
    setSubmitting(mode);
    setError(null);
    setSuccess(null);
    try {
      const created = await api.post<CompanyReport>("/api/company-reports", {
        period: form.period,
        npwp: form.npwp || null,
        nib: form.nib || null,
        city: form.city || null,
        postal_code: form.postal_code || null,
        sector: form.sector || null,
        male_count: Number(form.male_count) || 0,
        female_count: Number(form.female_count) || 0,
        status: "pending",
      });
      setHistory((prev) => [created, ...prev]);
      setSuccess(
        mode === "draft" ? "Draft laporan berhasil disimpan." : "Laporan berhasil dikirim ke Disnaker."
      );
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal mengirim laporan");
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat form laporan...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-950">Form Pelaporan Ketenagakerjaan Perusahaan</h1>
        <p className="mt-1 text-sm text-slate-500">Wajib dilaporkan setiap kuartal sesuai Permenaker No. 18 Tahun 2017</p>
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-4 py-3 text-sm text-status-danger">{error}</p>}
      {success && (
        <p className="rounded-lg bg-status-success-bg px-4 py-3 text-sm text-status-success">{success}</p>
      )}

      <Card>
        <CardHeader
          title="A. Identitas Perusahaan"
          action={<BuildingIcon className="h-5 w-5 text-navy-600" />}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Periode Laporan" required>
            <Input value={form.period} onChange={(e) => update("period", e.target.value)} placeholder="Q2 2024" />
          </Field>
          <Field label="Nama Perusahaan" required>
            <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} />
          </Field>
          <Field label="NPWP" required>
            <Input value={form.npwp} onChange={(e) => update("npwp", e.target.value)} placeholder="01.234.567.8-000.000" />
          </Field>
          <Field label="NIB / TDP" required>
            <Input value={form.nib} onChange={(e) => update("nib", e.target.value)} />
          </Field>
          <Field label="Kota / Kabupaten" required>
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="Kode Pos" required>
            <Input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
          </Field>
          <Field label="Sektor / Bidang Usaha" required>
            <Input value={form.sector} onChange={(e) => update("sector", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="C. Data Tenaga Kerja" action={<UsersIcon className="h-5 w-5 text-navy-600" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Laki-laki">
            <Input
              type="number"
              min={0}
              value={form.male_count}
              onChange={(e) => update("male_count", e.target.value)}
            />
            <p className="text-center text-xs text-slate-400">orang</p>
          </Field>
          <Field label="Perempuan">
            <Input
              type="number"
              min={0}
              value={form.female_count}
              onChange={(e) => update("female_count", e.target.value)}
            />
            <p className="text-center text-xs text-slate-400">orang</p>
          </Field>
          <div className="rounded-xl bg-navy-50 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-navy-900">Total</p>
            <p className="mt-1 text-2xl font-extrabold text-navy-950">{total}</p>
            <p className="text-xs text-slate-400">orang</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={submitting !== null}
          onClick={() => handleSubmit("draft")}
        >
          {submitting === "draft" ? "Menyimpan..." : "Simpan Draft"}
        </Button>
        <Button disabled={submitting !== null} onClick={() => handleSubmit("submit")}>
          <SendIcon className="h-4 w-4" />
          {submitting === "submit" ? "Mengirim..." : "Kirim Laporan ke Disnaker"}
        </Button>
      </div>

      <Card>
        <CardHeader title="Riwayat Laporan" subtitle="Laporan yang pernah dikirim ke Disnaker" />
        {history.length === 0 ? (
          <EmptyState title="Belum ada laporan" description="Laporan yang Anda kirim akan muncul di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Periode</th>
                  <th className="pb-3 pr-4 font-semibold">Tgl Lapor</th>
                  <th className="pb-3 pr-4 font-semibold">Tenaga Kerja</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {history.map((report) => (
                  <tr key={report.id}>
                    <td className="py-3 pr-4 font-semibold text-navy-950">{report.period}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatDateTime(report.submitted_at)}</td>
                    <td className="py-3 pr-4 text-slate-600">{report.total_count} orang</td>
                    <td className="py-3">
                      <StatusBadge status={report.status} label={statusLabel(report.status)} />
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
