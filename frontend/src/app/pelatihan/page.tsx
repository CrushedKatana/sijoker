"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { SafeImage } from "@/components/ui/SafeImage";
import { EmptyState } from "@/components/ui/StatCard";
import { CalendarIcon, GraduationCapIcon, SearchIcon, UsersIcon } from "@/components/ui/icons";
import { api, apiUrl, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Training } from "@/lib/types";

export default function TrainingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const [enrollState, setEnrollState] = useState<
    Record<number, { status: "idle" | "loading" | "enrolled" | "error"; message?: string }>
  >({});

  async function fetchTrainings(query: string) {
    setLoading(true);
    setError(null);
    try {
      const qs = query ? `?q=${encodeURIComponent(query)}` : "";
      const data = await api.get<Training[]>(`/api/trainings${qs}`);
      setTrainings(data);
    } catch {
      setError("Gagal memuat daftar pelatihan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrainings("");
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(trainings.map((t) => t.category).filter(Boolean))) as string[],
    [trainings]
  );

  const visibleTrainings = useMemo(
    () => (category ? trainings.filter((t) => t.category === category) : trainings),
    [trainings, category]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchTrainings(q);
  }

  async function handleEnroll(training: Training) {
    if (!user || user.role !== "pencari_kerja") {
      router.push("/login");
      return;
    }
    setEnrollState((s) => ({ ...s, [training.id]: { status: "loading" } }));
    try {
      await api.post(`/api/trainings/${training.id}/enroll`);
      setEnrollState((s) => ({
        ...s,
        [training.id]: { status: "enrolled", message: "Berhasil mendaftar pelatihan." },
      }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setEnrollState((s) => ({
          ...s,
          [training.id]: { status: "error", message: "Anda sudah terdaftar di pelatihan ini." },
        }));
      } else {
        setEnrollState((s) => ({
          ...s,
          [training.id]: { status: "error", message: "Gagal mendaftar. Coba lagi." },
        }));
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="border-b border-navy-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav className="mb-3 text-sm text-slate-500">
              <Link href="/" className="hover:text-navy-700">
                Beranda
              </Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-navy-700">Pelatihan</span>
            </nav>
            <h1 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">
              Daftar Pelatihan Tersedia
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Program pelatihan gratis bersertifikasi untuk meningkatkan daya saing kerja Anda.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-3 shadow-sm sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari pelatihan..."
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sm:w-56"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button type="submit">Cari</Button>
          </form>

          <div className="mt-6">
            {loading && (
              <p className="py-10 text-center text-sm text-slate-500">Memuat pelatihan...</p>
            )}
            {!loading && error && (
              <p className="rounded-xl bg-status-danger-bg px-4 py-3 text-sm text-status-danger">
                {error}
              </p>
            )}
            {!loading && !error && visibleTrainings.length === 0 && (
              <EmptyState
                title="Belum ada pelatihan ditemukan"
                description="Coba ubah kata kunci pencarian atau kategori."
              />
            )}
            {!loading && !error && visibleTrainings.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTrainings.map((training) => {
                  const state = enrollState[training.id];
                  const full = training.enrolled_count >= training.capacity;
                  return (
                    <div
                      key={training.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-950/[0.03]"
                    >
                      <div className="relative h-40 w-full bg-navy-50">
                        {training.category && (
                          <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-brand-orange-500 px-2.5 py-1 text-xs font-semibold text-navy-950">
                            {training.category}
                          </span>
                        )}
                        <SafeImage
                          src={training.banner_url ? apiUrl(training.banner_url) : null}
                          alt={training.title}
                          className="h-full w-full object-cover"
                          fallbackIcon={<GraduationCapIcon className="h-10 w-10" />}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 px-6 pb-6">
                        <h3 className="text-base font-bold text-navy-950">{training.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4" />
                            {training.scheduled_at ?? "Jadwal menyusul"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <UsersIcon className="h-4 w-4" />
                            Kuota: {training.enrolled_count} / {training.capacity}
                          </span>
                        </div>

                        {state?.message && (
                          <p
                            className={`text-sm ${
                              state.status === "enrolled" ? "text-status-success" : "text-status-danger"
                            }`}
                          >
                            {state.message}
                          </p>
                        )}

                        <div className="mt-auto flex flex-wrap gap-3 pt-2">
                          <Button
                            onClick={() => handleEnroll(training)}
                            disabled={state?.status === "loading" || state?.status === "enrolled" || full}
                            className="flex-1"
                          >
                            {state?.status === "enrolled"
                              ? "Terdaftar"
                              : full
                                ? "Kuota Penuh"
                                : "Daftar Sekarang"}
                          </Button>
                          <Button href={`/pelatihan/${training.id}`} variant="outline" className="flex-1">
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
