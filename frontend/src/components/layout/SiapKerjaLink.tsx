"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CloseIcon, ExternalLinkIcon } from "@/components/ui/icons";

export const SIAP_KERJA_URL = "https://siapkerja.kemnaker.go.id";

export function SiapKerjaLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={cn("text-left", className)} onClick={() => setOpen(true)}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                  <ExternalLinkIcon className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-bold text-navy-950">Menuju Portal Siap Kerja</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 text-slate-400 hover:text-slate-600"
                aria-label="Tutup"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Anda akan dialihkan ke platform eksternal milik Kementerian Ketenagakerjaan RI.
              Lanjutkan?
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  window.open(SIAP_KERJA_URL, "_blank", "noopener,noreferrer");
                  setOpen(false);
                }}
              >
                Lanjutkan
                <ExternalLinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
