"use client";

import { useEffect, useState } from "react";
import { api, apiUrl, ApiError } from "@/lib/api";
import type { Job, JobType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { Modal } from "../_components/Modal";
import { ConfirmDialog } from "../_components/ConfirmDialog";

interface JobForm {
  title: string;
  description: string;
  job_type: JobType;
  location: string;
  salary_min: string;
  salary_max: string;
  image_url: string;
}

const emptyForm: JobForm = {
  title: "",
  description: "",
  job_type: "full_time",
  location: "",
  salary_min: "",
  salary_max: "",
  image_url: "",
};

export default function LowonganPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<Job | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<Job[]>("/api/jobs")
      .then(setJobs)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat lowongan"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(job: Job) {
    setEditing(job);
    setForm({
      title: job.title,
      description: job.description,
      job_type: job.job_type,
      location: job.location ?? "",
      salary_min: job.salary_min?.toString() ?? "",
      salary_max: job.salary_max?.toString() ?? "",
      image_url: job.image_url ?? "",
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const payload = {
      title: form.title,
      description: form.description,
      job_type: form.job_type,
      location: form.location || null,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      image_url: form.image_url || null,
    };
    try {
      if (editing) {
        await api.patch<Job>(`/api/jobs/${editing.id}`, payload);
      } else {
        await api.post<Job>("/api/jobs", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan lowongan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/api/jobs/${deleting.id}`);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menghapus lowongan");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-navy-950">Manajemen Lowongan Pekerjaan</h1>
        <Button onClick={openCreate}>+ Tambah Lowongan Baru</Button>
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : jobs.length === 0 ? (
        <EmptyState title="Belum ada lowongan" description="Tambahkan lowongan pekerjaan baru untuk ditampilkan ke pencari kerja." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col gap-4 overflow-hidden p-0">
              <div className="h-40 w-full bg-navy-50">
                {job.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={apiUrl(job.image_url)} alt={job.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">Tidak ada gambar</div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 px-5 pb-5">
                <h3 className="text-base font-bold text-navy-950">{job.title}</h3>
                <p className="text-sm font-semibold text-navy-600">{job.company_name ?? "-"}</p>
                <p className="line-clamp-2 flex-1 text-sm text-slate-500">{job.description}</p>
                <div className="mt-2 flex items-center justify-end gap-3 border-t border-navy-100 pt-3">
                  <button
                    onClick={() => openEdit(job)}
                    className="rounded-full p-1.5 text-navy-600 hover:bg-navy-50"
                    aria-label="Edit lowongan"
                  >
                    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13.5 3.5 16.5 6.5 7 16H4V13L13.5 3.5Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleting(job)}
                    className="rounded-full p-1.5 text-status-danger hover:bg-status-danger-bg"
                    aria-label="Hapus lowongan"
                  >
                    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6h12M8 6V4.5A1 1 0 0 1 9 3.5h2a1 1 0 0 1 1 1V6M6 6l.7 9.5A1 1 0 0 0 7.7 16.5h4.6a1 1 0 0 0 1-1.5L14 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Lowongan" : "Tambah Lowongan Baru"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Judul Lowongan" required>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Deskripsi" required>
              <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipe Pekerjaan">
                <Select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value as JobType })}>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                </Select>
              </Field>
              <Field label="Lokasi">
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gaji Minimum">
                <Input type="number" min={0} value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
              </Field>
              <Field label="Gaji Maksimum">
                <Input type="number" min={0} value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
              </Field>
            </div>
            <Field label="URL Gambar" hint="Tautan gambar sampul lowongan">
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </Field>

            {formError && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{formError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Lowongan"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Hapus Lowongan"
          message={`Yakin ingin menghapus lowongan "${deleting.title}"? Tindakan ini tidak dapat dibatalkan.`}
          busy={deleteBusy}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
