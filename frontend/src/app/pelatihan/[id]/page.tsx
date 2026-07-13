"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SafeImage } from "@/components/ui/SafeImage";
import { CalendarIcon, GraduationCapIcon, MapPinIcon, UsersIcon } from "@/components/ui/icons";
import { api, apiUrl, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Training } from "@/lib/types";

export default function TrainingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [enrollState, setEnrollState] = useState<{
    status: "idle" | "loading" | "enrolled" | "error";
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Training>(`/api/trainings/${params.id}`)
      .then((data) => {
        if (!cancelled) setTraining(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleEnroll() {
    if (!training) return;
    if (!user || user.role !== "pencari_kerja") {
      router.push("/login");
      return;
    }
    setEnrollState({ status: "loading" });
    try {
      await api.post(`/api/trainings/${training.id}/enroll`);
      setEnrollState({ status: "enrolled", message: "Berhasil mendaftar pelatihan." });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setEnrollState({ status: "error", message: "Anda sudah terdaftar di pelatihan ini." });
      } else {
        setEnrollState({ status: "error", message: "Gagal mendaftar. Coba lagi." });
      }
    }
  }

  const full = training ? training.enrolled_count >= training.capacity : false;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-navy-700">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <Link href="/pelatihan" className="hover:text-navy-700">
              Pelatihan
            </Link>
          </nav>

          {loading && <p className="text-sm text-slate-500">Memuat detail pelatihan...</p>}
          {!loading && notFound && (
            <Card>
              <p className="text-sm text-slate-500">Pelatihan tidak ditemukan.</p>
              <Button href="/pelatihan" variant="outline" className="mt-4">
                Kembali ke Pelatihan
              </Button>
            </Card>
          )}

          {!loading && training && (
            <Card>
              <div className="relative h-56 w-full overflow-hidden rounded-xl bg-navy-50 sm:h-72">
                {training.category && (
                  <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-brand-orange-500 px-2.5 py-1 text-xs font-semibold text-navy-950">
                    {training.category}
                  </span>
                )}
                <SafeImage
                  src={training.banner_url ? apiUrl(training.banner_url) : null}
                  alt={training.title}
                  className="h-full w-full object-cover"
                  fallbackIcon={<GraduationCapIcon className="h-14 w-14" />}
                />
              </div>

              <h1 className="mt-6 text-2xl font-extrabold text-navy-950">{training.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-navy-100 py-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  {training.scheduled_at ?? "Jadwal menyusul"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UsersIcon className="h-4 w-4" />
                  Kuota: {training.enrolled_count} / {training.capacity}
                </span>
                {training.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4" />
                    {training.location}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <h2 className="text-base font-bold text-navy-950">Deskripsi Pelatihan</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {training.description ?? "Tidak ada deskripsi tambahan untuk pelatihan ini."}
                </p>
              </div>

              {enrollState.message && (
                <p
                  className={`mt-6 rounded-lg px-4 py-3 text-sm ${
                    enrollState.status === "enrolled"
                      ? "bg-status-success-bg text-status-success"
                      : "bg-status-danger-bg text-status-danger"
                  }`}
                >
                  {enrollState.message}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={handleEnroll}
                  size="lg"
                  disabled={
                    enrollState.status === "loading" || enrollState.status === "enrolled" || full
                  }
                >
                  {enrollState.status === "enrolled"
                    ? "Terdaftar"
                    : full
                      ? "Kuota Penuh"
                      : "Daftar Sekarang"}
                </Button>
                <Button href="/pelatihan" variant="outline" size="lg">
                  Kembali
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
