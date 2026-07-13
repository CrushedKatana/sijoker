export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRole(role: string) {
  const map: Record<string, string> = {
    admin: "Admin",
    operator: "Operator",
    pencari_kerja: "Pencari Kerja",
    perusahaan: "Perusahaan",
  };
  return map[role] ?? role;
}

export function formatJobType(jobType: string) {
  return jobType === "full_time" ? "Full-time" : "Part-time";
}

export function timeAgo(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return diffMinutes <= 1 ? "Baru saja" : `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return diffDays === 1 ? "1 hari lalu" : `${diffDays} hari lalu`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return diffWeeks === 1 ? "1 minggu lalu" : `${diffWeeks} minggu lalu`;
  return formatDate(value);
}

export function salaryRange(min: number | null | undefined, max: number | null | undefined) {
  if (!min && !max) return "Gaji dapat dinegosiasikan";
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  return formatCurrency(min ?? max);
}
