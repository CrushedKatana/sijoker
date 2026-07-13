"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { QuestionType, Survey } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils";
import { Modal } from "../_components/Modal";

interface QuestionDraft {
  question_type: QuestionType;
  text: string;
  required: boolean;
  options: string[];
}

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  rating: "Penilaian Bintang",
  multiple_choice: "Pilihan Ganda",
  short_answer: "Jawaban Singkat",
};

function newQuestion(): QuestionDraft {
  return { question_type: "rating", text: "", required: true, options: [] };
}

export default function SurveiPage() {
  const [tab, setTab] = useState<"buat" | "hasil">("buat");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-navy-950">Survei Kepuasan</h1>
        <div className="flex gap-2 rounded-full bg-navy-50 p-1">
          <button
            onClick={() => setTab("buat")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "buat" ? "bg-navy-600 text-white" : "text-navy-600"
            }`}
          >
            Buat Survei
          </button>
          <button
            onClick={() => setTab("hasil")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "hasil" ? "bg-navy-600 text-white" : "text-navy-600"
            }`}
          >
            Hasil Survei
          </button>
        </div>
      </div>

      {tab === "buat" ? <SurveyBuilder /> : <SurveyResultsList />}
    </div>
  );
}

function SurveyBuilder() {
  const [title, setTitle] = useState("Survei Kepuasan Pelayanan");
  const [subtitle, setSubtitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, newQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
  }

  function addOption(index: number) {
    updateQuestion(index, { options: [...questions[index].options, ""] });
  }

  function updateOption(index: number, optIndex: number, value: string) {
    const opts = [...questions[index].options];
    opts[optIndex] = value;
    updateQuestion(index, { options: opts });
  }

  function removeOption(index: number, optIndex: number) {
    updateQuestion(index, { options: questions[index].options.filter((_, i) => i !== optIndex) });
  }

  async function handlePublish(status: "draft" | "published") {
    setError(null);
    setSuccess(null);
    if (!title.trim()) {
      setError("Judul survei wajib diisi.");
      return;
    }
    if (questions.length === 0 || questions.some((q) => !q.text.trim())) {
      setError("Setiap pertanyaan wajib memiliki teks.");
      return;
    }
    setSaving(status);
    try {
      await api.post<Survey>("/api/surveys", {
        title,
        subtitle: subtitle || null,
        status,
        questions: questions.map((q, i) => ({
          question_type: q.question_type,
          text: q.text,
          required: q.required,
          options: q.question_type === "multiple_choice" ? q.options.filter((o) => o.trim()) : null,
          order: i,
        })),
      });
      setSuccess(status === "published" ? "Survei berhasil dipublikasikan." : "Survei disimpan sebagai draft.");
      setTitle("Survei Kepuasan Pelayanan");
      setSubtitle("");
      setQuestions([newQuestion()]);
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal menyimpan survei");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-5">
      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}
      {success && <p className="rounded-lg bg-status-success-bg px-3 py-2 text-sm text-status-success">{success}</p>}

      <Card>
        <Field label="Judul Survei" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-bold" />
        </Field>
        <div className="mt-4">
          <Field label="Subjudul">
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Mis. IKM — Disnaker Kota Batu 2026" />
          </Field>
        </div>
      </Card>

      {questions.map((q, index) => (
        <Card key={index} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Select
              className="w-48"
              value={q.question_type}
              onChange={(e) => updateQuestion(index, { question_type: e.target.value as QuestionType })}
            >
              <option value="rating">Penilaian Bintang</option>
              <option value="multiple_choice">Pilihan Ganda</option>
              <option value="short_answer">Jawaban Singkat</option>
            </Select>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(index, { required: e.target.checked })} />
              Wajib diisi
            </label>
            <button
              onClick={() => removeQuestion(index)}
              className="ml-auto rounded-full p-1.5 text-status-danger hover:bg-status-danger-bg"
              aria-label="Hapus pertanyaan"
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h12M8 6V4.5A1 1 0 0 1 9 3.5h2a1 1 0 0 1 1 1V6M6 6l.7 9.5A1 1 0 0 0 7.7 16.5h4.6a1 1 0 0 0 1-1.5L14 6" />
              </svg>
            </button>
          </div>

          <Input
            placeholder={`${index + 1}. Tulis pertanyaan...`}
            value={q.text}
            onChange={(e) => updateQuestion(index, { text: e.target.value })}
          />

          {q.question_type === "multiple_choice" && (
            <div className="space-y-2 pl-1">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-navy-200" />
                  <Input
                    className="flex-1"
                    value={opt}
                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                    placeholder={`Opsi ${optIndex + 1}`}
                  />
                  <button onClick={() => removeOption(index, optIndex)} className="text-slate-400 hover:text-status-danger" aria-label="Hapus opsi">
                    ×
                  </button>
                </div>
              ))}
              <button onClick={() => addOption(index)} className="text-sm font-semibold text-navy-600 hover:underline">
                + Tambah opsi
              </button>
            </div>
          )}

          {q.question_type === "short_answer" && <p className="border-b border-dashed border-navy-200 pb-2 text-sm text-slate-400">Jawaban singkat</p>}
        </Card>
      ))}

      <button
        onClick={addQuestion}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy-200 py-4 text-sm font-semibold text-navy-600 hover:bg-navy-50/40"
      >
        + Tambah Pertanyaan
      </button>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          Pratinjau
        </Button>
        <Button onClick={() => handlePublish("published")} disabled={saving !== null}>
          {saving === "published" ? "Memublikasikan..." : "Publikasikan Survei"}
        </Button>
      </div>

      {showPreview && (
        <Modal title="Pratinjau Survei" onClose={() => setShowPreview(false)}>
          <h3 className="text-lg font-bold text-navy-950">{title || "(Tanpa judul)"}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-4 space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-navy-100 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Badge tone="info">{QUESTION_TYPE_LABEL[q.question_type]}</Badge>
                  {q.required && <span className="font-semibold text-status-danger">*Wajib</span>}
                </div>
                <p className="mt-2 text-sm font-semibold text-navy-950">
                  {i + 1}. {q.text || "(Tanpa teks pertanyaan)"}
                </p>
                {q.question_type === "multiple_choice" && (
                  <ul className="mt-2 space-y-1 text-sm text-slate-500">
                    {q.options.filter(Boolean).map((o, oi) => (
                      <li key={oi}>○ {o}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function SurveyResultsList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Survey[]>("/api/surveys?published_only=false")
      .then(setSurveys)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat survei"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : surveys.length === 0 ? (
        <EmptyState title="Belum ada survei" description="Buat survei terlebih dahulu pada tab Buat Survei." />
      ) : (
        surveys.map((s) => (
          <Card key={s.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-navy-950">{s.title}</h3>
                <Badge tone={s.status === "published" ? "success" : "neutral"}>{s.status === "published" ? "Terpublikasi" : "Draft"}</Badge>
              </div>
              {s.subtitle && <p className="text-sm text-slate-500">{s.subtitle}</p>}
              <p className="mt-1 text-xs text-slate-400">
                {s.questions.length} pertanyaan · Dibuat {formatDate(s.created_at)}
              </p>
            </div>
            <Button href={`/admin/survei/${s.id}/hasil`} variant="outline">
              Lihat Hasil
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
