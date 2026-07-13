"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "./Modal";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Hapus",
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          Batal
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Memproses..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
