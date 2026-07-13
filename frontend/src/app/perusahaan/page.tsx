"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Application, CompanyDashboard, CompanyProfile, Job } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard, EmptyState } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { formatDate, initials } from "@/lib/utils";
import {
  BriefcaseIcon,
  BuildingIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  EyeIcon,
  UsersIcon,
} from "@/components/ui/icons";

const CHART_HEIGHT = 200;

function statusLabel(status: string) {
  const map: Record<string, string> = {
    ditinjau: "Ditinjau",
    interview: "Interview",
    diterima: "Diterima",
    ditolak: "Ditolak",
  };
  return map[status] ?? status;
}

export default function CompanyDashboardPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [dashboard, setDashboard] = useState<CompanyDashboard | null>(null);
  const [recentApplicants, setRecentApplicants] = useState<Application[]>([]);
  const [newJobsThisMonth, setNewJobsThisMonth] = useState(0);
  const [newApplicantsThisWeek, setNewApplicantsThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profileRes, dashboardRes, jobs] = await Promise.all([
          api.get<CompanyProfile>("/api/users/me/company-profile"),
          api.get<CompanyDashboard>("/api/dashboard/company"),
          api.get<Job[]>("/api/jobs/mine"),
        ]);
        if (cancelled) return;
        setProfile(profileRes);
        setDashboard(dashboardRes);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setNewJobsThisMonth(jobs.filter((j) => new Date(j.created_at) >= monthStart).length);

        const applicantLists = await Promise.all(
          jobs.map((job) => api.get<Application[]>(`/api/jobs/${job.id}/applicants`))
        );
        if (cancelled) return;
        const merged = applicantLists.flat().sort(
          (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
        );
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        setNewApplicantsThisWeek(merged.filter((a) => new Date(a.applied_at) >= weekAgo).length);
        setRecentApplicants(merged.slice(0, 5));
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat data dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const trend = dashboard?.applicant_trend ?? [];
  const maxValue = useMemo(() => {
    const raw = Math.max(1, ...trend.map((p) => p.value));
    const rounded = Math.ceil(raw / 15) * 15;
    return Math.max(15, rounded);
  }, [trend]);
  const ticks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => Math.round((maxValue / steps) * i));
  }, [maxValue]);

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat dashboard...</p>;
  }

  if (error) {
    return <p className="rounded-lg bg-status-danger-bg px-4 py-3 text-sm text-status-danger">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
            <BuildingIcon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-navy-950">{profile?.company_name}</h1>
              {profile?.verified && <Badge tone="success">Terverifikasi</Badge>}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {[
                profile?.nib ? `NIB: ${profile.nib}` : null,
                profile?.sector,
                profile?.city,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <Button variant="outline" href="/perusahaan/profil" className="self-start sm:self-auto">
          Edit Profil
        </Button>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BriefcaseIcon className="h-5 w-5" />}
          label="Lowongan Aktif"
          value={dashboard?.active_jobs ?? 0}
          hint={newJobsThisMonth > 0 ? `${newJobsThisMonth} baru bulan ini` : undefined}
        />
        <StatCard
          icon={<UsersIcon className="h-5 w-5" />}
          label="Total Pelamar"
          value={dashboard?.total_applicants ?? 0}
          hint={newApplicantsThisWeek > 0 ? `+${newApplicantsThisWeek} minggu ini` : undefined}
        />
        <StatCard
          icon={<ClipboardCheckIcon className="h-5 w-5" />}
          label="Laporan Terakhir"
          value={dashboard?.last_report_period ?? "-"}
          hint={dashboard?.last_report_period ? "Selesai dikirim" : "Belum ada laporan"}
        />
        <StatCard
          icon={<CheckCircleIcon className="h-5 w-5" />}
          label="Status Akun"
          value={dashboard?.account_status === "aktif" ? "Aktif" : "Nonaktif"}
          hint={profile?.verified ? "Terverifikasi Disnaker" : "Menunggu verifikasi"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tren Pelamar" />
          {trend.length === 0 ? (
            <EmptyState title="Belum ada data pelamar" />
          ) : (
            <div className="flex gap-2 pl-2">
              <div
                className="flex shrink-0 flex-col justify-between pr-2 text-right text-xs text-slate-400"
                style={{ height: CHART_HEIGHT }}
              >
                {[...ticks].reverse().map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
              <div className="flex-1">
                <div className="relative border-l border-navy-100" style={{ height: CHART_HEIGHT }}>
                  {ticks.map((tick) => (
                    <div
                      key={tick}
                      className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-navy-100"
                      style={{ bottom: (tick / maxValue) * CHART_HEIGHT }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-end gap-3 px-2">
                    {trend.map((point, i) => {
                      const barHeight = Math.max(2, (point.value / maxValue) * CHART_HEIGHT);
                      return (
                        <div
                          key={`${point.label}-${i}`}
                          className="relative flex flex-1 justify-center"
                          onMouseEnter={() => setHovered(i)}
                          onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                        >
                          {hovered === i && (
                            <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-navy-950 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                              {point.value} pelamar
                            </div>
                          )}
                          <div
                            className="w-full max-w-[28px] rounded-t-[4px] bg-navy-600 transition-colors hover:bg-navy-700"
                            style={{ height: barHeight }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex gap-3 px-2 text-center text-xs text-slate-400">
                  {trend.map((point, i) => (
                    <span key={`${point.label}-${i}`} className="flex-1">
                      {point.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Pelamar Terbaru"
            action={
              <Link href="/perusahaan/lowongan" className="text-sm font-semibold text-navy-600 hover:underline">
                Lihat semua
              </Link>
            }
          />
          {recentApplicants.length === 0 ? (
            <EmptyState title="Belum ada pelamar" description="Pelamar baru akan muncul di sini." />
          ) : (
            <ul className="divide-y divide-navy-100">
              {recentApplicants.map((applicant) => (
                <li key={applicant.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">
                    {initials(applicant.applicant_name ?? "?")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-950">{applicant.applicant_name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {applicant.job_title} &middot; {formatDate(applicant.applied_at)}
                    </p>
                  </div>
                  <StatusBadge status={applicant.status} label={statusLabel(applicant.status)} />
                  <Link
                    href={`/perusahaan/lowongan/${applicant.job_id}`}
                    className="text-slate-400 hover:text-navy-600"
                    aria-label="Lihat pelamar"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
