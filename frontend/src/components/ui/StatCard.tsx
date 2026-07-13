import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function StatCard({
  icon,
  label,
  value,
  hint,
  hintTone = "neutral",
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  hintTone?: "neutral" | "success" | "danger";
  className?: string;
}) {
  const hintClasses = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-status-success-bg text-status-success",
    danger: "bg-status-danger-bg text-status-danger",
  }[hintTone];

  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
            {icon}
          </div>
        )}
        {hint && (
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", hintClasses)}>{hint}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-navy-950">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-100 bg-navy-50/40 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
