"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Job, JobType } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/StatCard";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { MapPinIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon, WalletIcon } from "@/components/ui/icons";

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

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicantCounts, setApplicantCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadJobs() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Job[]>("/api/jobs/mine");
      setJobs(data);
      const counts = await Promise.all(
        data.map(async (job) => {
          try {
            const applicants = await api.get<unknown[]>(`/api/jobs/${job.id}/applicants`);
            return [job.id, applicants.length] as const;
          } catch {
            return [job.id, 0] as const;
          }
        })
      );
      setApplicantCounts(Object.fromEntries(counts));
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat lowongan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function update<K extends keyof JobForm>(key: K, value: JobForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditingJob(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(job: Job) {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      job_type: job.job_type,
      location: job.location ?? "",
      salary_min: job.salary_min?.toString() ?? "",
      salary_max: job.salary_max?.toString() ?? "",
      image_url: job.image_url ?? "",
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingJob(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
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
      if (editingJob) {
        const updated = await api.patch<Job>(`/api/jobs/${editingJob.id}`, payload);
        setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      } else {
        const created = await api.post<Job>("/api/jobs", payload);
        setJobs((prev) => [created, ...prev]);
        setApplicantCounts((prev) => ({ ...prev, [created.id]: 0 }));
      }
      closeForm();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan lowongan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(job: Job) {
    if (!window.confirm(`Hapus lowongan "${job.title}"?`)) return;
    setDeletingId(job.id);
    setError(null);
    try {
      await api.delete(`/api/jobs/${job.id}`);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menghapus lowongan");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleStatus(job: Job) {
    setError(null);
    try {
      const updated = await api.patch<Job>(`/api/jobs/${job.id}`, {
        status: job.status === "aktif" ? "nonaktif" : "aktif",
      });
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal mengubah status lowongan");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-950">Lowongan Perusahaan</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola lowongan yang Anda publikasikan dan pelamarnya.</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          Tambah Lowongan
        </Button>
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-4 py-3 text-sm text-status-danger">{error}</p>}

      {formOpen && (
        <Card>
          <CardHeader title={editingJob ? "Edit Lowongan" : "Tambah Lowongan Baru"} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Judul Lowongan" required>
              <Input value={form.title} required onChange={(e) => update("title", e.target.value)} />
            </Field>
            <Field label="Deskripsi" required>
              <Textarea
                value={form.description}
                required
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tipe Pekerjaan">
                <Select value={form.job_type} onChange={(e) => update("job_type", e.target.value as JobType)}>
                  <option value="full_time">Penuh Waktu</option>
                  <option value="part_time">Paruh Waktu</option>
                </Select>
              </Field>
              <Field label="Lokasi">
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
              </Field>
              <Field label="Gaji Minimum">
                <Input
                  type="number"
                  min={0}
                  value={form.salary_min}
                  onChange={(e) => update("salary_min", e.target.value)}
                />
              </Field>
              <Field label="Gaji Maksimum">
                <Input
                  type="number"
                  min={0}
                  value={form.salary_max}
                  onChange={(e) => update("salary_max", e.target.value)}
                />
              </Field>
            </div>
            <Field label="URL Gambar" hint="Opsional - tautan gambar/banner lowongan">
              <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} />
            </Field>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeForm}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : editingJob ? "Simpan Perubahan" : "Publikasikan Lowongan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Memuat lowongan...</p>
      ) : jobs.length === 0 ? (
        <EmptyState title="Belum ada lowongan" description="Buat lowongan pertama Anda untuk mulai menerima pelamar." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-navy-950">{job.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">Diposting {formatDate(job.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStatus(job)}
                  className="shrink-0"
                  title="Klik untuk ubah status"
                >
                  <StatusBadge status={job.status} label={job.status === "aktif" ? "Aktif" : "Nonaktif"} />
                </button>
              </div>

              <p className="line-clamp-2 text-sm text-slate-600">{job.description}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {job.location ?? "-"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <WalletIcon className="h-3.5 w-3.5" />
                  {job.salary_min || job.salary_max
                    ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                    : "-"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <UsersIcon className="h-3.5 w-3.5" />
                  {applicantCounts[job.id] ?? 0} pelamar
                </span>
                <span className={cn("rounded-full px-2 py-0.5 font-semibold", "bg-navy-50 text-navy-700")}>
                  {job.job_type === "full_time" ? "Penuh Waktu" : "Paruh Waktu"}
                </span>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 border-t border-navy-100 pt-4">
                <Button href={`/perusahaan/lowongan/${job.id}`} size="sm" variant="outline">
                  <UsersIcon className="h-4 w-4" />
                  Kelola Pelamar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(job)}>
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(job)}
                  disabled={deletingId === job.id}
                >
                  <TrashIcon className="h-4 w-4" />
                  {deletingId === job.id ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
