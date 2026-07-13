"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { CompanyProfile } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BuildingIcon, PencilIcon } from "@/components/ui/icons";

interface ProfileForm {
  company_name: string;
  official_email: string;
  phone: string;
  sector: string;
  website: string;
  npwp: string;
}

const emptyForm: ProfileForm = {
  company_name: "",
  official_email: "",
  phone: "",
  sector: "",
  website: "",
  npwp: "",
};

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api.get<CompanyProfile>("/api/users/me/company-profile");
        if (cancelled) return;
        setProfile(data);
        setForm({
          company_name: data.company_name ?? "",
          official_email: data.official_email ?? "",
          phone: data.phone ?? "",
          sector: data.sector ?? "",
          website: data.website ?? "",
          npwp: data.npwp ?? "",
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat profil");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await api.put<CompanyProfile>("/api/users/me/company-profile", {
        company_name: form.company_name,
        official_email: form.official_email || null,
        phone: form.phone || null,
        sector: form.sector || null,
        website: form.website || null,
        npwp: form.npwp || null,
      });
      setProfile(updated);
      setSuccess("Profil perusahaan berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat profil...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-navy-950">Profil Perusahaan</h1>

      {error && <p className="rounded-lg bg-status-danger-bg px-4 py-3 text-sm text-status-danger">{error}</p>}
      {success && (
        <p className="rounded-lg bg-status-success-bg px-4 py-3 text-sm text-status-success">{success}</p>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
              <BuildingIcon className="h-11 w-11" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-white">
              <PencilIcon className="h-4 w-4" />
            </span>
          </div>
          <p className="text-base font-bold text-navy-950">{profile?.company_name}</p>
          {profile?.verified ? (
            <Badge tone="success">Terverifikasi Disnaker</Badge>
          ) : (
            <Badge tone="neutral">Belum Terverifikasi</Badge>
          )}
        </Card>

        <Card>
          <CardHeader title="Informasi Perusahaan" />
          <div className="space-y-4">
            <Field label="Nama Perusahaan">
              <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email Resmi">
                <Input
                  type="email"
                  value={form.official_email}
                  onChange={(e) => update("official_email", e.target.value)}
                />
              </Field>
              <Field label="Nomor Telepon">
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
            </div>
            <Field label="Sektor Usaha">
              <Input value={form.sector} onChange={(e) => update("sector", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Website">
                <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="www.perusahaan.co.id" />
              </Field>
              <Field label="NPWP">
                <Input value={form.npwp} onChange={(e) => update("npwp", e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
