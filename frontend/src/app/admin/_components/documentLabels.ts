import type { DocumentStatus, DocumentType } from "@/lib/types";

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  belum_diunggah: "Belum Diunggah",
  menunggu: "Proses Verifikasi",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  ktp: "Foto KTP",
  kartu_keluarga: "Foto Kartu Keluarga",
  ijazah: "Foto Ijazah Terakhir",
  kartu_ak1: "Kartu AK1 (Kartu Kuning)",
};

export const DOCUMENT_TYPE_ORDER: DocumentType[] = ["ktp", "kartu_keluarga", "ijazah", "kartu_ak1"];
