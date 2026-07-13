"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SafeImage } from "@/components/ui/SafeImage";
import { EmptyState } from "@/components/ui/StatCard";
import { BriefcaseIcon, ClockIcon, MapPinIcon, SearchIcon } from "@/components/ui/icons";
import { api, apiUrl, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Job } from "@/lib/types";
import { formatJobType, salaryRange, timeAgo } from "@/lib/utils";

function JobsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  const [applyState, setApplyState] = useState<
    Record<number, { status: "idle" | "loading" | "applied" | "error"; message?: string }>
  >({});

  async function fetchJobs(query: string, loc: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (loc) params.set("location", loc);
      const qs = params.toString();
      const data = await api.get<Job[]>(`/api/jobs${qs ? `?${qs}` : ""}`);
      setJobs(data);
    } catch {
      setError("Gagal memuat daftar lowongan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs(searchParams.get("q") ?? "", searchParams.get("location") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    router.push(`/loker${params.toString() ? `?${params.toString()}` : ""}`);
    fetchJobs(q, location);
  }

  async function handleApply(job: Job) {
    if (!user || user.role !== "pencari_kerja") {
      router.push("/login");
      return;
    }
    setApplyState((s) => ({ ...s, [job.id]: { status: "loading" } }));
    try {
      await api.post("/api/jobs/applications", { job_id: job.id });
      setApplyState((s) => ({
        ...s,
        [job.id]: { status: "applied", message: "Lamaran berhasil dikirim." },
      }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setApplyState((s) => ({
          ...s,
          [job.id]: { status: "error", message: "Anda sudah melamar pekerjaan ini." },
        }));
      } else {
        setApplyState((s) => ({
          ...s,
          [job.id]: { status: "error", message: "Gagal mengirim lamaran. Coba lagi." },
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
            <h1 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">Bursa Lowongan Kerja</h1>
            <p className="mt-1 text-sm text-slate-500">
              Temukan peluang karir terverifikasi dari perusahaan mitra resmi.
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
                placeholder="Cari Posisi"
                className="pl-9"
              />
            </div>
            <div className="relative flex-1">
              <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lokasi"
                className="pl-9"
              />
            </div>
            <Button type="submit">Cari Loker</Button>
          </form>

          <div className="mt-6 space-y-5">
            {loading && (
              <p className="py-10 text-center text-sm text-slate-500">Memuat lowongan...</p>
            )}
            {!loading && error && (
              <p className="rounded-xl bg-status-danger-bg px-4 py-3 text-sm text-status-danger">
                {error}
              </p>
            )}
            {!loading && !error && jobs.length === 0 && (
              <EmptyState
                title="Belum ada lowongan ditemukan"
                description="Coba ubah kata kunci pencarian atau lokasi."
              />
            )}
            {!loading &&
              !error &&
              jobs.map((job) => {
                const state = applyState[job.id];
                return (
                  <Card key={job.id} className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-navy-50 sm:h-auto sm:w-48">
                      <SafeImage
                        src={job.image_url ? apiUrl(job.image_url) : null}
                        alt={job.title}
                        className="h-full w-full object-cover"
                        fallbackIcon={<BriefcaseIcon className="h-10 w-10" />}
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-bold text-navy-950">{job.title}</h2>
                          <p className="text-sm font-semibold text-navy-600">
                            {job.company_name ?? "Perusahaan"}
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
                          {formatJobType(job.job_type)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="h-4 w-4" />
                          {job.location ?? "Lokasi tidak disebutkan"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          {salaryRange(job.salary_min, job.salary_max)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ClockIcon className="h-4 w-4" />
                          {timeAgo(job.created_at)}
                        </span>
                      </div>

                      {state?.message && (
                        <p
                          className={`mt-3 text-sm ${
                            state.status === "applied" ? "text-status-success" : "text-status-danger"
                          }`}
                        >
                          {state.message}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button href={`/loker/${job.id}`} variant="outline">
                          Lihat Detail
                        </Button>
                        <Button
                          onClick={() => handleApply(job)}
                          disabled={state?.status === "loading" || state?.status === "applied"}
                        >
                          {state?.status === "applied" ? "Sudah Melamar" : "Lamar Sekarang"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={null}>
      <JobsPageInner />
    </Suspense>
  );
}
