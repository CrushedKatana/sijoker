"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
        ✉
      </div>
      <h1 className="text-2xl font-bold text-navy-950">Atur Ulang Kata Sandi</h1>
      <p className="mt-2 text-sm text-slate-500">
        Masukkan email terdaftar. Kami akan mengirimkan tautan reset kata sandi.
      </p>

      {sent ? (
        <p className="mt-6 rounded-lg bg-status-success-bg px-3 py-2 text-sm text-status-success">
          Jika email terdaftar, tautan reset telah dikirim.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Tautan Reset"}
          </Button>
        </form>
      )}

      <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-navy-600">
        ← Kembali ke Login
      </Link>
    </div>
  );
}
