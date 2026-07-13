"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type AccountKind = "job-seeker" | "company";

const roleHome: Record<string, string> = {
  pencari_kerja: "/dashboard",
  perusahaan: "/perusahaan",
};

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [kind, setKind] = useState<AccountKind>("job-seeker");
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak sama");
      return;
    }
    setLoading(true);
    try {
      const path = kind === "job-seeker" ? "/api/auth/register/job-seeker" : "/api/auth/register/company";
      const payload =
        kind === "job-seeker"
          ? { name, email, phone, nik: idNumber, password }
          : { name, email, phone, nib: idNumber, password };
      const auth = await api.post<AuthResponse>(path, payload);
      loginWithToken(auth);
      router.push(roleHome[auth.role] ?? "/");
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-950">Pendaftaran Akun Baru</h1>
      <p className="mt-1 text-sm text-slate-500">Daftar gratis dan akses seluruh layanan ketenagakerjaan</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-navy-50 p-1 text-sm font-semibold">
        {(
          [
            { key: "job-seeker", label: "Pencari Kerja" },
            { key: "company", label: "Perusahaan" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setKind(tab.key)}
            className={cn(
              "rounded-full py-2 transition-colors",
              kind === tab.key ? "bg-navy-600 text-white" : "text-navy-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label={kind === "job-seeker" ? "Nama Lengkap" : "Nama Perusahaan"} required>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Sesuai KTP / Akta Perusahaan" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={kind === "job-seeker" ? "NIK" : "NIB"} required>
            <Input required value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
          </Field>
          <Field label="Email" required>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <Field label="Nomor Telepon" required>
          <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx xxxx xxxx" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kata Sandi" required>
            <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Konfirmasi Kata Sandi" required>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
        </div>

        {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-navy-600">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
