import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-status-success-bg text-status-success",
  warning: "bg-status-warning-bg text-status-warning",
  danger: "bg-status-danger-bg text-status-danger",
  info: "bg-status-info-bg text-status-info",
  neutral: "bg-slate-100 text-slate-600",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE_MAP: Record<string, Tone> = {
  aktif: "success",
  nonaktif: "neutral",
  ditinjau: "warning",
  interview: "info",
  diterima: "success",
  ditolak: "danger",
  belum_mulai: "neutral",
  berjalan: "info",
  selesai: "success",
  pending: "danger",
  diproses: "warning",
  rendah: "success",
  sedang: "warning",
  tinggi: "danger",
  draft: "neutral",
  published: "success",
  proses: "warning",
  belum_diunggah: "neutral",
  menunggu: "warning",
  terverifikasi: "success",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE_MAP[status] ?? "neutral";
  return <Badge tone={tone}>{label ?? status}</Badge>;
}
