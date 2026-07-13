"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import type { AccountStatus, Role, UserAccount } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard, EmptyState } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { cn, formatDate, formatRole, initials } from "@/lib/utils";
import { Modal } from "../_components/Modal";
import { ConfirmDialog } from "../_components/ConfirmDialog";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "pencari_kerja", label: "Pencari Kerja" },
  { value: "perusahaan", label: "Perusahaan" },
  { value: "admin", label: "Admin" },
  { value: "operator", label: "Operator" },
];

const ROLE_BADGE_TONE: Record<Role, "info" | "success" | "danger" | "warning"> = {
  pencari_kerja: "info",
  perusahaan: "success",
  admin: "danger",
  operator: "warning",
};

interface CreateForm {
  role: Role;
  name: string;
  email: string;
  password: string;
}

const emptyCreateForm: CreateForm = { role: "pencari_kerja", name: "", email: "", password: "" };

export default function AkunPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState<AccountStatus>("aktif");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleting, setDeleting] = useState<UserAccount | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load(query: string) {
    setLoading(true);
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    Promise.all([api.get<UserAccount[]>(`/api/accounts${qs}`), api.get<Record<string, number>>("/api/accounts/summary")])
      .then(([acc, sum]) => {
        setAccounts(acc);
        setSummary(sum);
      })
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat akun"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name || !createForm.email || createForm.password.length < 8) {
      setCreateError("Lengkapi semua kolom. Kata sandi minimal 8 karakter.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await api.post<UserAccount>("/api/accounts", createForm);
      setShowCreate(false);
      setCreateForm(emptyCreateForm);
      load(q);
    } catch (err) {
      setCreateError(err instanceof ApiError ? String(err.detail) : "Gagal menambah akun");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(account: UserAccount) {
    setEditing(account);
    setEditName(account.name);
    setEditEmail(account.email);
    setEditStatus(account.status);
    setEditError(null);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      await api.patch<UserAccount>(`/api/accounts/${editing.id}`, {
        name: editName,
        email: editEmail,
        status: editStatus,
      });
      setEditing(null);
      load(q);
    } catch (err) {
      setEditError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan perubahan");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/api/accounts/${deleting.id}`);
      setDeleting(null);
      load(q);
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menghapus akun");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-navy-950">Manajemen Akun</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setCreateForm(emptyCreateForm);
              setCreateError(null);
              setShowCreate(true);
            }}
          >
            + Tambah Akun Baru
          </Button>
        )}
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}
      {!isAdmin && (
        <p className="rounded-lg bg-status-warning-bg px-3 py-2 text-sm text-status-warning">
          Akun operator hanya dapat melihat daftar akun. Tambah, ubah, dan hapus akun memerlukan peran admin.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pencari Kerja" value={summary?.pencari_kerja ?? "-"} />
        <StatCard label="Perusahaan" value={summary?.perusahaan ?? "-"} />
        <StatCard label="Admin" value={summary?.admin ?? "-"} />
        <StatCard label="Operator" value={summary?.operator ?? "-"} />
      </div>

      <Card>
        <Input placeholder="Cari akun..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      </Card>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat...</p>
        ) : accounts.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Belum ada akun" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-4 font-semibold">Nama / Instansi</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Tipe Akun</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Bergabung</th>
                  {isAdmin && <th className="px-6 py-4 font-semibold">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-navy-50 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">
                          {initials(a.name)}
                        </div>
                        <span className="font-semibold text-navy-950">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{a.email}</td>
                    <td className="px-6 py-4">
                      <Badge tone={ROLE_BADGE_TONE[a.role]}>{formatRole(a.role)}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={a.status === "aktif" ? "success" : "neutral"}>{a.status === "aktif" ? "Aktif" : "Nonaktif"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(a.created_at)}</td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(a)} className="rounded-full border border-navy-200 px-3 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-50">
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleting(a)}
                            className="rounded-full p-1.5 text-status-danger hover:bg-status-danger-bg"
                            aria-label="Hapus akun"
                          >
                            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6h12M8 6V4.5A1 1 0 0 1 9 3.5h2a1 1 0 0 1 1 1V6M6 6l.7 9.5A1 1 0 0 0 7.7 16.5h4.6a1 1 0 0 0 1-1.5L14 6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showCreate && (
        <Modal title="Tambah Akun Baru" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-navy-900">
                Tipe Akun <span className="text-status-danger">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: opt.value })}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
                      createForm.role === opt.value
                        ? "border-navy-600 bg-navy-50 text-navy-700"
                        : "border-navy-100 text-slate-500 hover:bg-navy-50/60"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Nama / Nama Perusahaan" required>
              <Input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Sesuai identitas resmi" />
            </Field>
            <Field label="Email" required>
              <Input
                required
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="nama@email.com"
              />
            </Field>
            <Field label="Kata Sandi Awal" required hint="Minimal 8 karakter">
              <Input
                required
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Min. 8 karakter"
              />
            </Field>

            {createError && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{createError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Menyimpan..." : "Tambah Akun"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Akun" onClose={() => setEditing(null)} maxWidth="max-w-md">
          <form onSubmit={handleEditSave} className="space-y-4">
            <Field label="Nama">
              <Input required value={editName} onChange={(e) => setEditName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input required type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </Field>
            <Field label="Status">
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value as AccountStatus)}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </Select>
            </Field>

            {editError && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{editError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Hapus Akun"
          message={`Yakin ingin menghapus akun "${deleting.name}"? Tindakan ini tidak dapat dibatalkan.`}
          busy={deleteBusy}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
