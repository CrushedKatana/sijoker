"use client";

import { useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { AlertTriangleIcon, CheckCircleIcon } from "@/components/ui/icons";
import { api, ApiError } from "@/lib/api";
import type { Complaint } from "@/lib/types";

const initialForm = {
  full_name: "",
  nik: "",
  category: "",
  detail: "",
  evidence_url: "",
};

export default function ComplaintPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Complaint | null>(null);

  function update<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const complaint = await api.post<Complaint>("/api/complaints", {
        full_name: form.full_name,
        nik: form.nik || null,
        category: form.category,
        detail: form.detail,
        evidence_url: form.evidence_url || null,
      });
      setResult(complaint);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal mengirim laporan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="border-b border-navy-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">
              Formulir Pengaduan Tenaga Kerja
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sampaikan keluhan atau pelanggaran hak ketenagakerjaan Anda secara aman dan
              transparan.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          {result ? (
            <Card className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-success-bg text-status-success">
                <CheckCircleIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-xl font-bold text-navy-950">Laporan Berhasil Dikirim</h2>
              <p className="mt-2 text-sm text-slate-500">
                Simpan kode tiket berikut untuk memantau status pengaduan Anda.
              </p>
              <p className="mt-4 inline-block rounded-xl bg-navy-50 px-6 py-3 text-lg font-extrabold tracking-wide text-navy-700">
                {result.ticket_code}
              </p>
              <div className="mt-6">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Kirim Laporan Lain
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex items-start gap-3 rounded-xl bg-brand-orange-100 px-4 py-3 text-sm text-brand-orange-600">
                <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Pastikan data yang Anda masukkan akurat. Laporan palsu dapat dikenakan sanksi.</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <Field label="Nama Lengkap" required>
                  <Input
                    required
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </Field>
                <Field label="NIK" required>
                  <Input
                    required
                    value={form.nik}
                    onChange={(e) => update("nik", e.target.value)}
                    placeholder="Masukkan NIK"
                    inputMode="numeric"
                    maxLength={16}
                  />
                </Field>
                <Field label="Kategori Pengaduan" required>
                  <Input
                    required
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="Contoh: Upah tidak dibayar, PHK sepihak, dsb."
                  />
                </Field>
                <Field label="Detail Laporan" required>
                  <Textarea
                    required
                    value={form.detail}
                    onChange={(e) => update("detail", e.target.value)}
                    placeholder="Jelaskan kronologi kejadian secara lengkap"
                  />
                </Field>
                <Field label="URL Bukti (Opsional)" hint="Tautan foto, dokumen, atau rekaman pendukung laporan Anda.">
                  <Input
                    type="url"
                    value={form.evidence_url}
                    onChange={(e) => update("evidence_url", e.target.value)}
                    placeholder="https://..."
                  />
                </Field>

                {error && (
                  <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">
                    {error}
                  </p>
                )}

                <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim Laporan"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
