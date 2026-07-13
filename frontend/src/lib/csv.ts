function escapeCsvCell(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Builds a CSV string from headers + rows and triggers a client-side download.
 * A lightweight stand-in for a real Excel export — no library dependency needed.
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(","));
  const csv = "﻿" + lines.join("\n"); // BOM so Excel opens UTF-8 correctly
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
