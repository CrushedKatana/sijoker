"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SafeImage } from "@/components/ui/SafeImage";
import { BriefcaseIcon, ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { api, apiUrl, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Job } from "@/lib/types";
import { formatJobType, salaryRange, timeAgo } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applyState, setApplyState] = useState<{
    status: "idle" | "loading" | "applied" | "error";
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Job>(`/api/jobs/${params.id}`)
      .then((data) => {
        if (!cancelled) setJob(data);
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

  async function handleApply() {
    if (!job) return;
    if (!user || user.role !== "pencari_kerja") {
      router.push("/login");
      return;
    }
    setApplyState({ status: "loading" });
    try {
      await api.post("/api/jobs/applications", { job_id: job.id });
      setApplyState({ status: "applied", message: "Lamaran berhasil dikirim." });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setApplyState({ status: "error", message: "Anda sudah melamar pekerjaan ini." });
      } else {
        setApplyState({ status: "error", message: "Gagal mengirim lamaran. Coba lagi." });
      }
    }
  }

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
            <Link href="/loker" className="hover:text-navy-700">
              Info Loker
            </Link>
          </nav>

          {loading && <p className="text-sm text-slate-500">Memuat detail lowongan...</p>}
          {!loading && notFound && (
            <Card>
              <p className="text-sm text-slate-500">Lowongan tidak ditemukan.</p>
              <Button href="/loker" variant="outline" className="mt-4">
                Kembali ke Info Loker
              </Button>
            </Card>
          )}

          {!loading && job && (
            <Card>
              <div className="h-56 w-full overflow-hidden rounded-xl bg-navy-50 sm:h-72">
                <SafeImage
                  src={job.image_url ? apiUrl(job.image_url) : null}
                  alt={job.title}
                  className="h-full w-full object-cover"
                  fallbackIcon={<BriefcaseIcon className="h-14 w-14" />}
                />
              </div>

              <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-navy-950">{job.title}</h1>
                  <p className="mt-1 text-base font-semibold text-navy-600">
                    {job.company_name ?? "Perusahaan"}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700">
                  {formatJobType(job.job_type)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-navy-100 py-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  {job.location ?? "Lokasi tidak disebutkan"}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-navy-700">
                  {salaryRange(job.salary_min, job.salary_max)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  Diposting {timeAgo(job.created_at)}
                </span>
              </div>

              <div className="mt-6">
                <h2 className="text-base font-bold text-navy-950">Deskripsi Pekerjaan</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {job.description}
                </p>
              </div>

              {applyState.message && (
                <p
                  className={`mt-6 rounded-lg px-4 py-3 text-sm ${
                    applyState.status === "applied"
                      ? "bg-status-success-bg text-status-success"
                      : "bg-status-danger-bg text-status-danger"
                  }`}
                >
                  {applyState.message}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={handleApply}
                  size="lg"
                  disabled={applyState.status === "loading" || applyState.status === "applied"}
                >
                  {applyState.status === "applied" ? "Sudah Melamar" : "Lamar Sekarang"}
                </Button>
                <Button href="/loker" variant="outline" size="lg">
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
