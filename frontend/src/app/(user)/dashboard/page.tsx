"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Application, Enrollment, Job, JobSeekerDashboard } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard, EmptyState } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { IconArrowRight, IconBuilding, IconChat, IconDocument, IconGraduationCap, IconSend } from "@/components/ui/icons";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<JobSeekerDashboard | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [dash, apps, enrolls, jobs] = await Promise.all([
          api.get<JobSeekerDashboard>("/api/dashboard/job-seeker"),
          api.get<Application[]>("/api/jobs/applications/mine"),
          api.get<Enrollment[]>("/api/trainings/enrollments/mine"),
          api.get<Job[]>("/api/jobs"),
        ]);
        if (!active) return;
        setSummary(dash);
        setApplications(apps);
        setEnrollments(enrolls);
        setRecommended(jobs.slice(0, 3));
      } catch {
        if (active) setError("Gagal memuat data dashboard. Silakan coba lagi.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-500">Memuat dashboard...</div>;
  }

  if (error) {
    return <div className="py-24 text-center text-sm text-status-danger">{error}</div>;
  }

  const completion = summary?.profile_completion ?? 0;
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-8 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-navy-700/40" />
        <div className="relative">
          <h1 className="text-2xl font-extrabold">Selamat Datang, {firstName}! 👋</h1>
          <p className="mt-1 text-sm text-slate-300">
            Lengkapi profil Anda untuk meningkatkan peluang lamaran kerja.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-brand-orange-500 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-semibold">{completion}% lengkap</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconSend className="h-5 w-5" />}
          label="Lamaran Dikirim"
          value={summary?.applications_sent ?? 0}
        />
        <StatCard
          icon={<IconChat className="h-5 w-5" />}
          label="Proses Interview"
          value={summary?.interviews_in_progress ?? 0}
        />
        <StatCard
          icon={<IconGraduationCap className="h-5 w-5" />}
          label="Pelatihan Diikuti"
          value={summary?.trainings_joined ?? 0}
        />
        <StatCard
          icon={<IconDocument className="h-5 w-5" />}
          label="Dokumen Aktif"
          value={summary?.active_documents ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Riwayat Lamaran" />
          {applications.length === 0 ? (
            <EmptyState
              title="Belum ada lamaran"
              description="Lamaran pekerjaan Anda akan muncul di sini."
            />
          ) : (
            <div className="divide-y divide-navy-100">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-300">
                    <IconBuilding className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-950">{app.job_title ?? "-"}</p>
                    <p className="truncate text-xs text-slate-500">
                      {app.company_name ?? "-"} &middot; {formatDate(app.applied_at)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Pelatihan Saya" />
            {enrollments.length === 0 ? (
              <EmptyState
                title="Belum ada pelatihan"
                description="Ikuti pelatihan untuk meningkatkan kompetensi Anda."
              />
            ) : (
              <div className="space-y-5">
                {enrollments.map((e) => (
                  <div key={e.id}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <p className="truncate font-bold text-navy-950">{e.training_title ?? "-"}</p>
                      <span className="shrink-0 font-semibold text-navy-600">{e.progress_percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-50">
                      <div
                        className="h-full rounded-full bg-navy-600 transition-all"
                        style={{ width: `${e.progress_percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Loker Direkomendasikan" />
            {recommended.length === 0 ? (
              <EmptyState title="Belum ada loker" />
            ) : (
              <div className="space-y-3">
                {recommended.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 rounded-xl border border-navy-100 px-3 py-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-300">
                      <IconBuilding className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-navy-950">{job.title}</p>
                      <p className="truncate text-xs text-slate-500">{job.company_name ?? "-"}</p>
                    </div>
                    <IconArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
