"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, apiUrl, ApiError } from "@/lib/api";
import type { DocumentRecord, Participant } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { initials } from "@/lib/utils";
import { DOCUMENT_TYPE_LABEL, DOCUMENT_TYPE_ORDER, DOCUMENT_STATUS_LABEL } from "../../_components/documentLabels";

export default function DokumenPesertaDetailPage() {
  const params = useParams<{ id: string }>();
  const participantId = Number(params.id);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      api.get<Participant[]>("/api/documents/participants"),
      api.get<DocumentRecord[]>(`/api/documents/participants/${participantId}`),
    ])
      .then(([participants, docs]) => {
        setParticipant(participants.find((p) => p.id === participantId) ?? null);
        setDocuments(docs);
      })
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Gagal memuat dokumen peserta"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [participantId]);

  async function setStatus(doc: DocumentRecord, status: "terverifikasi" | "ditolak") {
    setBusyId(doc.id);
    try {
      await api.patch<DocumentRecord>(`/api/documents/${doc.id}`, { status });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Gagal memperbarui status dokumen");
    } finally {
      setBusyId(null);
    }
  }

  const orderedDocs = DOCUMENT_TYPE_ORDER.map((type) => documents.find((d) => d.document_type === type)).filter(
    (d): d is DocumentRecord => Boolean(d)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Dokumen Peserta</h1>
        <Link href="/admin/dokumen-peserta" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:underline">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4 6 10l6 6" />
          </svg>
          Kembali ke Daftar
        </Link>
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : !participant ? (
        <Card>
          <p className="text-sm text-slate-500">Peserta tidak ditemukan.</p>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-600 text-lg font-bold text-white">
                {initials(participant.name)}
              </div>
              <div>
                <p className="text-lg font-bold text-navy-950">{participant.name}</p>
                <p className="text-sm text-slate-500">NIK: {participant.nik ?? "-"}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {orderedDocs.map((doc) => (
              <Card key={doc.id} className="flex flex-col gap-4 p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-navy-950">
                    <DocTypeIcon type={doc.document_type} />
                    {DOCUMENT_TYPE_LABEL[doc.document_type]}
                  </div>
                  <StatusBadge status={doc.status} label={DOCUMENT_STATUS_LABEL[doc.status]} />
                </div>

                {doc.file_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={apiUrl(doc.file_url)} alt={DOCUMENT_TYPE_LABEL[doc.document_type]} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 flex-col items-center justify-center gap-2 bg-navy-50/60 text-slate-400">
                    <svg viewBox="0 0 20 20" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 3v9M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 15.5h12" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm">Dokumen belum diunggah oleh peserta</p>
                  </div>
                )}

                <div className="flex gap-3 px-5 pb-5">
                  {doc.status === "terverifikasi" ? (
                    <Button variant="outline" className="flex-1 !border-status-danger/30 !text-status-danger" disabled={busyId === doc.id} onClick={() => setStatus(doc, "ditolak")}>
                      {busyId === doc.id ? "Memproses..." : "Batalkan"}
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 !bg-status-success hover:!bg-status-success/90"
                      disabled={!doc.file_url || busyId === doc.id}
                      onClick={() => setStatus(doc, "terverifikasi")}
                    >
                      {busyId === doc.id ? "Memproses..." : "Verifikasi"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DocTypeIcon({ type }: { type: string }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-navy-500">
      {type === "ktp" && <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />}
      {type === "kartu_keluarga" && <circle cx="10" cy="10" r="6" />}
      {type === "ijazah" && <path d="M10 3 3 6.5l7 3.5 7-3.5L10 3Z" />}
      {type === "kartu_ak1" && <rect x="4" y="2.5" width="12" height="15" rx="1.2" />}
    </svg>
  );
}
