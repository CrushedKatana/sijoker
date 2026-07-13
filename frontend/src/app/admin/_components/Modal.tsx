"use client";

import { cn } from "@/lib/utils";

export function Modal({
  title,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 px-4 py-8">
      <div
        className={cn(
          "max-h-full w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl",
          maxWidth
        )}
      >
        <div className="mb-5 flex items-center justify-between border-b border-navy-100 pb-4">
          <h2 className="text-lg font-bold text-navy-950">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-navy-50 hover:text-navy-700"
            aria-label="Tutup"
          >
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
