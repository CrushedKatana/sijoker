"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Application, ApplicationStatus, Job } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/StatCard";
import { formatDateTime, initials } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/ui/icons";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "ditinjau", label: "Ditinjau" },
  { value: "interview", label: "Interview" },
  { value: "diterima", label: "Diterima" },
  { value: "ditolak", label: "Ditolak" },
];

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export default function JobApplicantsPage() {
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    async function load() {
      try {
        const [jobRes, applicantsRes] = await Promise.all([
          api.get<Job>(`/api/jobs/${jobId}`),
          api.get<Application[]>(`/api/jobs/${jobId}/applicants`),
        ]);
        if (cancelled) return;
        setJob(jobRes);
        setApplicants(applicantsRes);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat data pelamar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  async function updateStatus(applicationId: number, status: ApplicationStatus) {
    setUpdatingId(applicationId);
    setError(null);
    try {
      const updated = await api.patch<Application>(`/api/jobs/applications/${applicationId}`, { status });
      setApplicants((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal mengubah status pelamar");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat data pelamar...</p>;
  }

  return (
    <div className="space-y-6">
      <Button href="/perusahaan/lowongan" variant="ghost" size="sm" className="px-0">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Lowongan
      </Button>

      {error && <p className="rounded-lg bg-status-danger-bg px-4 py-3 text-sm text-status-danger">{error}</p>}

      <div>
        <h1 className="text-xl font-bold text-navy-950">{job?.title ?? "Lowongan"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {job?.location ?? "-"} &middot; {applicants.length} pelamar
        </p>
      </div>

      <Card>
        <CardHeader title="Daftar Pelamar" />
        {applicants.length === 0 ? (
          <EmptyState title="Belum ada pelamar" description="Pelamar untuk lowongan ini akan muncul di sini." />
        ) : (
          <ul className="divide-y divide-navy-100">
            {applicants.map((applicant) => (
              <li key={applicant.id} className="flex flex-wrap items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">
                  {initials(applicant.applicant_name ?? "?")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-950">{applicant.applicant_name}</p>
                  <p className="truncate text-xs text-slate-500">Melamar {formatDateTime(applicant.applied_at)}</p>
                </div>
                <StatusBadge status={applicant.status} label={statusLabel(applicant.status)} />
                <Select
                  value={applicant.status}
                  disabled={updatingId === applicant.id}
                  onChange={(e) => updateStatus(applicant.id, e.target.value as ApplicationStatus)}
                  className="w-auto"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
