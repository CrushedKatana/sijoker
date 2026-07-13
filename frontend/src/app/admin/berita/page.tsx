"use client";

import { useEffect, useState } from "react";
import { api, apiUrl, ApiError } from "@/lib/api";
import type { NewsArticle, NewsStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils";
import { ConfirmDialog } from "../_components/ConfirmDialog";

interface NewsForm {
  title: string;
  thumbnail_url: string;
  content: string;
  category: string;
}

const emptyForm: NewsForm = { title: "", thumbnail_url: "", content: "", category: "" };

export default function BeritaPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [saving, setSaving] = useState<NewsStatus | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<NewsArticle | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<NewsArticle[]>("/api/news?published_only=false")
      .then(setArticles)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat berita"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function openEdit(article: NewsArticle) {
    setEditing(article);
    setForm({
      title: article.title,
      thumbnail_url: article.thumbnail_url ?? "",
      content: article.content,
      category: article.category ?? "",
    });
    setFormError(null);
  }

  async function handleSave(status: NewsStatus) {
    if (!form.title || !form.content) {
      setFormError("Judul dan konten berita wajib diisi.");
      return;
    }
    setSaving(status);
    setFormError(null);
    const payload = {
      title: form.title,
      thumbnail_url: form.thumbnail_url || null,
      content: form.content,
      category: form.category || null,
      status,
    };
    try {
      if (editing) {
        await api.patch<NewsArticle>(`/api/news/${editing.id}`, payload);
      } else {
        await api.post<NewsArticle>("/api/news", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan berita");
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/api/news/${deleting.id}`);
      if (editing?.id === deleting.id) resetForm();
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menghapus berita");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-950">Manajemen Berita</h1>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Tambah / Edit Berita"
            action={
              editing && (
                <button onClick={resetForm} className="text-sm font-semibold text-navy-600 hover:underline">
                  + Berita baru
                </button>
              )
            }
          />
          <div className="space-y-4">
            <Field label="Judul Berita" required>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Kategori">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Mis. Pelatihan, Pengumuman" />
            </Field>
            <Field label="URL Thumbnail" hint="Tautan gambar sampul berita (dropzone gambar belum tersedia)">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-navy-200 bg-navy-50/40 px-4 py-4">
                <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-navy-400">
                  <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" />
                  <circle cx="7" cy="8" r="1.4" />
                  <path d="M3.5 14.5 8 10l3 3 2.5-2.5 3 3" />
                </svg>
                <Input
                  className="border-0 bg-transparent px-0 focus:ring-0"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="Tempel URL gambar thumbnail..."
                />
              </div>
            </Field>
            <Field label="Konten Berita" required>
              <Textarea
                className="min-h-[220px]"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Tulis konten berita..."
              />
            </Field>

            {formError && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => handleSave("published")} disabled={saving !== null}>
                {saving === "published" ? "Memublikasikan..." : "Publikasikan"}
              </Button>
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving !== null}>
                {saving === "draft" ? "Menyimpan..." : "Draft"}
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Artikel Terpublikasi</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat...</p>
          ) : articles.length === 0 ? (
            <EmptyState title="Belum ada artikel" />
          ) : (
            <div className="space-y-4">
              {articles.map((a) => (
                <Card key={a.id} className="flex gap-3 p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                    {a.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={apiUrl(a.thumbnail_url)} alt={a.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-navy-950">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {a.status === "draft" ? "Draft" : formatDate(a.published_at ?? a.created_at)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button onClick={() => openEdit(a)} className="text-navy-600 hover:text-navy-800" aria-label="Edit">
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13.5 3.5 16.5 6.5 7 16H4V13L13.5 3.5Z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleting(a)} className="text-status-danger hover:text-status-danger/80" aria-label="Hapus">
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 6h12M8 6V4.5A1 1 0 0 1 9 3.5h2a1 1 0 0 1 1 1V6M6 6l.7 9.5A1 1 0 0 0 7.7 16.5h4.6a1 1 0 0 0 1-1.5L14 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Hapus Berita"
          message={`Yakin ingin menghapus berita "${deleting.title}"?`}
          busy={deleteBusy}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
