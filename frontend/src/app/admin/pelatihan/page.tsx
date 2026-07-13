"use client";

import { useEffect, useState } from "react";
import { api, apiUrl, ApiError } from "@/lib/api";
import type { Training } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils";
import { ConfirmDialog } from "../_components/ConfirmDialog";

interface TrainingForm {
  title: string;
  description: string;
  capacity: string;
  location: string;
  scheduled_at: string;
  banner_url: string;
}

const emptyForm: TrainingForm = { title: "", description: "", capacity: "", location: "", scheduled_at: "", banner_url: "" };

export default function PelatihanPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Training | null>(null);
  const [form, setForm] = useState<TrainingForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<Training | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<Training[]>("/api/trainings")
      .then(setTrainings)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat pelatihan"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function openEdit(t: Training) {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description ?? "",
      capacity: t.capacity ? String(t.capacity) : "",
      location: t.location ?? "",
      scheduled_at: t.scheduled_at ?? "",
      banner_url: t.banner_url ?? "",
    });
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      setFormError("Judul pelatihan wajib diisi.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      title: form.title,
      description: form.description || null,
      capacity: form.capacity ? Number(form.capacity) : 0,
      location: form.location || null,
      scheduled_at: form.scheduled_at || null,
      banner_url: form.banner_url || null,
    };
    try {
      if (editing) {
        await api.patch<Training>(`/api/trainings/${editing.id}`, payload);
      } else {
        await api.post<Training>("/api/trainings", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan pelatihan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/api/trainings/${deleting.id}`);
      if (editing?.id === deleting.id) resetForm();
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menghapus pelatihan");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-950">Manajemen Pelatihan</h1>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      <Card>
        <CardHeader
          title={editing ? "Edit Pelatihan" : "Tambah Pelatihan Baru"}
          action={
            editing && (
              <button onClick={resetForm} className="text-sm font-semibold text-navy-600 hover:underline">
                + Pelatihan baru
              </button>
            )
          }
        />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Judul Pelatihan" required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Deskripsi">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Kapasitas Peserta">
              <Input type="number" min={0} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </Field>
            <Field label="Lokasi Pelaksanaan">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
          </div>
          <Field label="Tanggal & Waktu" hint="Mis. Senin, 20 Juli 2026 - 09:00 WIB">
            <Input value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
          </Field>
          <Field label="Banner Pelatihan" hint="Tautan gambar banner (dropzone gambar belum tersedia)">
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-navy-200 bg-navy-50/40 px-4 py-4">
              <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-navy-400">
                <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" />
                <circle cx="7" cy="8" r="1.4" />
                <path d="M3.5 14.5 8 10l3 3 2.5-2.5 3 3" />
              </svg>
              <Input
                className="border-0 bg-transparent px-0 focus:ring-0"
                value={form.banner_url}
                onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                placeholder="Tempel URL banner pelatihan..."
              />
            </div>
          </Field>

          {formError && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{formError}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Pelatihan Baru"}
            </Button>
          </div>
        </form>
      </Card>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Daftar Pelatihan</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Memuat...</p>
        ) : trainings.length === 0 ? (
          <EmptyState title="Belum ada pelatihan" />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {trainings.map((t) => (
              <Card key={t.id} className="flex flex-col gap-3 overflow-hidden p-0">
                <div className="h-32 w-full bg-navy-50">
                  {t.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={apiUrl(t.banner_url)} alt={t.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">Tidak ada banner</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 px-5 pb-5">
                  <h3 className="text-base font-bold text-navy-950">{t.title}</h3>
                  <p className="text-sm text-slate-500">{t.location ?? "Lokasi belum ditentukan"}</p>
                  <p className="text-xs text-slate-400">{t.scheduled_at ?? "Jadwal belum ditentukan"}</p>
                  <p className="mt-1 text-sm font-semibold text-navy-600">
                    {t.enrolled_count}/{t.capacity} peserta
                  </p>
                  <p className="text-xs text-slate-400">Dibuat {formatDate(t.created_at)}</p>
                  <div className="mt-2 flex items-center justify-end gap-3 border-t border-navy-100 pt-3">
                    <button onClick={() => openEdit(t)} className="text-sm font-semibold text-navy-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => setDeleting(t)} className="text-sm font-semibold text-status-danger hover:underline">
                      Hapus
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Hapus Pelatihan"
          message={`Yakin ingin menghapus pelatihan "${deleting.title}"?`}
          busy={deleteBusy}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
