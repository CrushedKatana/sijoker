"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

const roleHome: Record<string, string> = {
  admin: "/admin",
  operator: "/admin",
  pencari_kerja: "/dashboard",
  perusahaan: "/perusahaan",
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(identifier, password);
      router.push(roleHome[user.role] ?? "/");
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-950">Selamat Datang</h1>
      <p className="mt-1 text-sm text-slate-500">Masuk ke portal layanan ketenagakerjaan</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Email" required>
          <Input
            type="email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Masukkan email"
          />
        </Field>
        <Field label="Kata Sandi" required>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan kata sandi"
          />
          <Link href="/forgot-password" className="mt-1 inline-block text-xs font-semibold text-navy-600">
            Lupa kata sandi?
          </Link>
        </Field>

        {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-navy-600">
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}
