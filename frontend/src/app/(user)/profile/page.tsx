"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import type { DocumentRecord, DocumentType, JobSeekerDashboard, JobSeekerProfile } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { initials } from "@/lib/utils";
import {
  IconAward,
  IconFileText,
  IconIdCard,
  IconPencil,
  IconUpload,
  IconUsers,
} from "@/components/ui/icons";

interface MeResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const REQUIRED_DOCUMENT_TYPES: DocumentType[] = ["ktp", "kartu_keluarga", "ijazah", "kartu_ak1"];

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  ktp: "Foto KTP",
  kartu_keluarga: "Foto Kartu Keluarga",
  ijazah: "Foto Ijazah Terakhir",
  kartu_ak1: "Kartu AK1 (Kartu Kuning)",
};

const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  belum_diunggah: "Belum diunggah",
  menunggu: "Menunggu",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

const DOCUMENT_ICONS: Record<DocumentType, (props: { className?: string }) => React.ReactElement> = {
  ktp: IconIdCard,
  kartu_keluarga: IconUsers,
  ijazah: IconAward,
  kartu_ak1: IconFileText,
};

interface PersonalForm {
  name: string;
  nik: string;
  phone: string;
  birth_place: string;
  birth_date: string;
  address: string;
}

interface EducationForm {
  last_education: string;
  major: string;
  skills: string;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [completion, setCompletion] = useState(0);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  const [personal, setPersonal] = useState<PersonalForm>({
    name: "",
    nik: "",
    phone: "",
    birth_place: "",
    birth_date: "",
    address: "",
  });
  const [education, setEducation] = useState<EducationForm>({
    last_education: "",
    major: "",
    skills: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<DocumentType, HTMLInputElement | null>>({
    ktp: null,
    kartu_keluarga: null,
    ijazah: null,
    kartu_ak1: null,
  });

  async function loadAll() {
    const [meRes, profile, dash, docs] = await Promise.all([
      api.get<MeResponse>("/api/auth/me"),
      api.get<JobSeekerProfile>("/api/users/me/job-seeker-profile"),
      api.get<JobSeekerDashboard>("/api/dashboard/job-seeker"),
      api.get<DocumentRecord[]>("/api/documents/mine"),
    ]);
    setMe(meRes);
    setCompletion(dash.profile_completion);
    setDocuments(docs);
    setPersonal({
      name: meRes.name ?? "",
      nik: profile.nik ?? "",
      phone: profile.phone ?? "",
      birth_place: profile.birth_place ?? "",
      birth_date: profile.birth_date ?? "",
      address: profile.address ?? "",
    });
    setEducation({
      last_education: profile.last_education ?? "",
      major: profile.major ?? "",
      skills: profile.skills ?? "",
    });
  }

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        await loadAll();
      } catch {
        if (active) setError("Gagal memuat profil. Silakan coba lagi.");
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      await api.put("/api/users/me/job-seeker-profile", {
        name: personal.name,
        nik: personal.nik,
        phone: personal.phone,
        birth_place: personal.birth_place,
        birth_date: personal.birth_date,
        address: personal.address,
        last_education: education.last_education,
        major: education.major,
        skills: education.skills,
      });
      const dash = await api.get<JobSeekerDashboard>("/api/dashboard/job-seeker");
      setCompletion(dash.profile_completion);
      setSaveMessage("Perubahan berhasil disimpan.");
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(type: DocumentType, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingType(type);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.upload<DocumentRecord>(`/api/documents/mine/${type}`, formData);
      const docs = await api.get<DocumentRecord[]>("/api/documents/mine");
      setDocuments(docs);
      const dash = await api.get<JobSeekerDashboard>("/api/dashboard/job-seeker");
      setCompletion(dash.profile_completion);
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal mengunggah dokumen.");
    } finally {
      setUploadingType(null);
    }
  }

  function removeSkill(skill: string) {
    const remaining = skillChips.filter((s) => s !== skill);
    setEducation((prev) => ({ ...prev, skills: remaining.join(", ") }));
  }

  const skillChips = education.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-500">Memuat profil...</div>;
  }

  const nextMissingType = REQUIRED_DOCUMENT_TYPES.find((type) => {
    const doc = documents.find((d) => d.document_type === type);
    return (doc?.status ?? "belum_diunggah") === "belum_diunggah";
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Profil Saya</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola informasi pribadi dan dokumen Anda</p>
      </div>

      {error && (
        <p className="rounded-lg bg-status-danger-bg px-4 py-2.5 text-sm text-status-danger">{error}</p>
      )}
      {saveMessage && (
        <p className="rounded-lg bg-status-success-bg px-4 py-2.5 text-sm text-status-success">{saveMessage}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-navy-600 text-2xl font-extrabold text-white">
                {initials(me?.name ?? user?.name ?? "")}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-navy-600 text-white">
                <IconPencil className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-4 text-lg font-bold text-navy-950">{me?.name}</p>
            <p className="text-sm text-slate-500">{me?.email}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-status-success-bg px-3 py-1 text-xs font-semibold text-status-success">
              <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
              Akun Aktif
            </span>

            <div className="mt-6 w-full text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-navy-900">Kelengkapan Profil</span>
                <span className="font-bold text-navy-950">{completion}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-50">
                <div
                  className="h-full rounded-full bg-navy-600 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Status Dokumen" />
            <div className="divide-y divide-navy-100">
              {REQUIRED_DOCUMENT_TYPES.map((type) => {
                const doc = documents.find((d) => d.document_type === type);
                const status = doc?.status ?? "belum_diunggah";
                const Icon = DOCUMENT_ICONS[type];
                const isUploading = uploadingType === type;
                return (
                  <div key={type} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="min-w-0 flex-1 text-sm font-semibold text-navy-950">
                      {DOCUMENT_LABELS[type]}
                    </p>
                    <StatusBadge status={status} label={DOCUMENT_STATUS_LABELS[status]} />
                    <input
                      ref={(el) => {
                        fileInputRefs.current[type] = el;
                      }}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(type, e)}
                    />
                    <button
                      type="button"
                      title="Unggah dokumen"
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[type]?.click()}
                      className="shrink-0 text-slate-400 hover:text-navy-600 disabled:opacity-50"
                    >
                      <IconUpload className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              disabled={!nextMissingType || uploadingType !== null}
              onClick={() => nextMissingType && fileInputRefs.current[nextMissingType]?.click()}
            >
              {uploadingType ? "Mengunggah..." : "Unggah Dokumen"}
            </Button>
          </Card>
        </div>

        <form onSubmit={handleSave} className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Data Diri" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nama Lengkap">
                  <Input
                    value={personal.name}
                    onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="NIK (KTP)">
                <Input
                  value={personal.nik}
                  onChange={(e) => setPersonal((p) => ({ ...p, nik: e.target.value }))}
                />
              </Field>
              <Field label="Email" hint="Email tidak dapat diubah di sini">
                <Input value={me?.email ?? ""} disabled readOnly className="bg-navy-50/60 text-slate-500" />
              </Field>
              <Field label="No. Telepon">
                <Input
                  value={personal.phone}
                  onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                />
              </Field>
              <Field label="Tempat Lahir">
                <Input
                  value={personal.birth_place}
                  onChange={(e) => setPersonal((p) => ({ ...p, birth_place: e.target.value }))}
                />
              </Field>
              <Field label="Tanggal Lahir" hint="Contoh: 1998-04-11">
                <Input
                  value={personal.birth_date}
                  onChange={(e) => setPersonal((p) => ({ ...p, birth_date: e.target.value }))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Alamat Lengkap">
                  <Textarea
                    value={personal.address}
                    onChange={(e) => setPersonal((p) => ({ ...p, address: e.target.value }))}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Pendidikan & Keahlian" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Pendidikan Terakhir">
                <Input
                  value={education.last_education}
                  onChange={(e) => setEducation((p) => ({ ...p, last_education: e.target.value }))}
                />
              </Field>
              <Field label="Program Studi / Jurusan">
                <Input
                  value={education.major}
                  onChange={(e) => setEducation((p) => ({ ...p, major: e.target.value }))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Keahlian / Kompetensi" hint="Pisahkan dengan koma">
                  <Input
                    value={education.skills}
                    onChange={(e) => setEducation((p) => ({ ...p, skills: e.target.value }))}
                    placeholder="Contoh: React, TypeScript, Figma"
                  />
                </Field>
                {skillChips.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillChips.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-navy-400 hover:text-navy-700"
                          aria-label={`Hapus ${skill}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
