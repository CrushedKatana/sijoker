"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Survey, SurveyResults } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/StatCard";
import { downloadCsv } from "@/lib/csv";
import { CHART_COLORS } from "../../../_components/charts";

export default function SurveyResultsPage() {
  const params = useParams<{ id: string }>();
  const surveyId = Number(params.id);

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get<Survey>(`/api/surveys/${surveyId}`), api.get<SurveyResults>(`/api/surveys/${surveyId}/results`)])
      .then(([s, r]) => {
        setSurvey(s);
        setResults(r);
      })
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat hasil survei"))
      .finally(() => setLoading(false));
  }, [surveyId]);

  function exportCsv() {
    if (!results) return;
    const rows: (string | number)[][] = [];
    results.questions.forEach((q) => {
      q.options.forEach((o) => rows.push([q.text, o.label, o.count, `${o.percentage}%`]));
      if (q.options.length === 0) rows.push([q.text, "-", q.response_count, "-"]);
    });
    downloadCsv(`hasil-survei-${surveyId}.csv`, ["Pertanyaan", "Opsi", "Jumlah", "Persentase"], rows);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">{survey?.title ?? "Hasil Survei"}</h1>
        <Link href="/admin/survei" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:underline">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4 6 10l6 6" />
          </svg>
          Kembali ke Survei Kepuasan
        </Link>
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : !results ? (
        <EmptyState title="Hasil tidak ditemukan" />
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap gap-10">
                <Stat value={results.total_responses.toLocaleString("id-ID")} label="Total Responden" tone="text-navy-600" />
                <Stat value={results.average_score.toFixed(1)} label="Rata-rata Skor" tone="text-status-success" />
                <Stat value={`${results.satisfaction_rate}%`} label="Tingkat Kepuasan" tone="text-brand-orange-600" />
              </div>
              <Button variant="outline" className="!border-status-success/40 !text-status-success" onClick={exportCsv}>
                Export Hasil
              </Button>
            </div>
          </Card>

          {results.questions.length === 0 ? (
            <EmptyState title="Belum ada respons" description="Hasil akan muncul setelah peserta mengisi survei ini." />
          ) : (
            results.questions.map((q, i) => (
              <Card key={q.question_id}>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pertanyaan {i + 1}</p>
                    <h3 className="mt-1 text-base font-bold text-navy-950">{q.text}</h3>
                  </div>
                  {q.average_rating !== null && q.average_rating !== undefined && (
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-navy-950">
                        {q.average_rating}
                        <span className="text-sm font-medium text-slate-400"> /5</span>
                      </p>
                      <p className="text-xs text-slate-400">{q.response_count} responden</p>
                    </div>
                  )}
                  {(q.average_rating === null || q.average_rating === undefined) && (
                    <p className="text-xs text-slate-400">{q.response_count} responden</p>
                  )}
                </div>

                {q.options.length > 0 ? (
                  <div className="space-y-2.5">
                    {q.options.map((opt, oi) => (
                      <div key={opt.label} className="flex items-center gap-3">
                        <div className="w-20 shrink-0 truncate text-sm text-navy-900">{opt.label}</div>
                        <div className="relative h-7 flex-1 rounded-md bg-navy-50">
                          <div
                            className="flex h-7 items-center justify-end rounded-md px-2 text-xs font-semibold text-white"
                            style={{
                              width: `${Math.max(4, opt.percentage)}%`,
                              backgroundColor: CHART_COLORS[oi % CHART_COLORS.length],
                              minWidth: opt.percentage > 0 ? "2.5rem" : undefined,
                            }}
                          >
                            {opt.percentage > 0 ? `${opt.percentage}%` : ""}
                          </div>
                        </div>
                        <div className="w-10 shrink-0 text-right text-sm text-slate-500">{opt.count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Jawaban teks bebas — belum ada ringkasan otomatis.</p>
                )}
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div>
      <p className={`text-3xl font-extrabold ${tone}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
