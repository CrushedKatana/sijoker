"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { AdminDashboard } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { LineAreaChart, HorizontalBarChart } from "./_components/charts";
import { IconChartBar, IconAcademicCap, IconUsers, IconChat } from "./_components/icons";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AdminDashboard>("/api/dashboard/admin")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat data"));
  }, []);

  const topVillageCount = data?.participant_distribution.find((v) => v.label === data.top_village)?.value;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Statistik Portal SI JOKER</p>
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<IconUsers className="h-5 w-5" />}
          label="Jumlah Peserta"
          value={data ? data.total_participants.toLocaleString("id-ID") : "-"}
          hint={data ? `+${data.participants_this_month} bulan ini` : undefined}
          hintTone="success"
        />
        <StatCard
          icon={<IconAcademicCap className="h-5 w-5" />}
          label="Total Pelatihan"
          value={data ? data.total_trainings : "-"}
          hint={data ? `${data.ongoing_trainings} berlangsung` : undefined}
          hintTone="success"
        />
        <StatCard
          icon={<IconChartBar className="h-5 w-5" />}
          label="Desa Terbanyak"
          value={data?.top_village ?? "-"}
          hint={topVillageCount !== undefined ? `${topVillageCount} peserta` : undefined}
          hintTone="success"
        />
        <StatCard
          icon={<IconChat className="h-5 w-5" />}
          label="Jumlah Pengaduan"
          value={data ? data.total_complaints : "-"}
          hint={data ? `${data.pending_complaints} pending` : undefined}
          hintTone="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Kunjungan Harian Website" subtitle="7 hari terakhir" />
          {data ? <LineAreaChart points={data.daily_visits} /> : <ChartSkeleton />}
        </Card>
        <Card>
          <CardHeader title="Distribusi Peserta" subtitle="Berdasarkan desa & kecamatan" />
          {data ? <HorizontalBarChart data={data.participant_distribution} /> : <ChartSkeleton />}
        </Card>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-56 animate-pulse rounded-xl bg-navy-50" />;
}
