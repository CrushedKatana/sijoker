"use client";

import { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { CheckCircleIcon, StarIcon } from "@/components/ui/icons";
import { api, ApiError } from "@/lib/api";
import type { Survey } from "@/lib/types";

interface AnswerState {
  rating_value?: number;
  choice_value?: string;
  text_value?: string;
}

export default function SurveyPage() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get<Survey[]>("/api/surveys")
      .then((data) => setSurvey(data[0] ?? null))
      .catch(() => setSurvey(null))
      .finally(() => setLoading(false));
  }, []);

  function setAnswer(questionId: number, value: AnswerState) {
    setAnswers((a) => ({ ...a, [questionId]: { ...a[questionId], ...value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!survey) return;
    setError(null);

    const missingRequired = survey.questions.some((q) => {
      if (!q.required) return false;
      const answer = answers[q.id];
      if (q.question_type === "rating") return !answer?.rating_value;
      if (q.question_type === "multiple_choice") return !answer?.choice_value;
      return !answer?.text_value;
    });
    if (missingRequired) {
      setError("Mohon lengkapi semua pertanyaan wajib sebelum mengirim.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/surveys/${survey.id}/responses`, {
        answers: survey.questions.map((q) => ({
          question_id: q.id,
          rating_value: answers[q.id]?.rating_value ?? null,
          choice_value: answers[q.id]?.choice_value ?? null,
          text_value: answers[q.id]?.text_value ?? null,
        })),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal mengirim survei. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="border-b border-navy-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">
              {survey?.title ?? "Survei Kepuasan Pelayanan Masyarakat"}
            </h1>
            {survey?.subtitle && <p className="mt-1 text-sm text-slate-500">{survey.subtitle}</p>}
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          {loading && <p className="text-center text-sm text-slate-500">Memuat survei...</p>}

          {!loading && !survey && (
            <EmptyState
              title="Belum ada survei tersedia"
              description="Survei kepuasan layanan belum dipublikasikan. Silakan cek kembali nanti."
            />
          )}

          {!loading && survey && submitted && (
            <Card className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-success-bg text-status-success">
                <CheckCircleIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-xl font-bold text-navy-950">Terima Kasih atas Masukan Anda</h2>
              <p className="mt-2 text-sm text-slate-500">
                Tanggapan Anda membantu kami meningkatkan kualitas layanan ketenagakerjaan.
              </p>
            </Card>
          )}

          {!loading && survey && !submitted && (
            <Card>
              <form onSubmit={handleSubmit} className="space-y-7">
                {[...survey.questions]
                  .sort((a, b) => a.order - b.order)
                  .map((question, index) => (
                    <div key={question.id} className="border-b border-navy-100 pb-6 last:border-0 last:pb-0">
                      <p className="text-sm font-bold text-navy-950">
                        {index + 1}. {question.text}{" "}
                        {question.required && <span className="text-status-danger">*</span>}
                      </p>

                      {question.question_type === "rating" && (
                        <div className="mt-3 flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const active = (answers[question.id]?.rating_value ?? 0) >= star;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setAnswer(question.id, { rating_value: star })}
                                aria-label={`${star} bintang`}
                                className={active ? "text-brand-orange-500" : "text-navy-100"}
                              >
                                <StarIcon filled={active} className="h-8 w-8" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {question.question_type === "multiple_choice" && (
                        <div className="mt-3 space-y-2">
                          {(question.options ?? []).map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 text-sm text-navy-900"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={answers[question.id]?.choice_value === option}
                                onChange={() => setAnswer(question.id, { choice_value: option })}
                                className="h-4 w-4 accent-navy-600"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}

                      {question.question_type === "short_answer" && (
                        <Textarea
                          className="mt-3"
                          value={answers[question.id]?.text_value ?? ""}
                          onChange={(e) => setAnswer(question.id, { text_value: e.target.value })}
                          placeholder="Saran & masukan tambahan..."
                        />
                      )}
                    </div>
                  ))}

                {error && (
                  <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim Survei"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
