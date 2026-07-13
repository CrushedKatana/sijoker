import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClasses =
  "w-full rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20";

export function Field({
  label,
  required,
  children,
  hint,
}: {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-semibold text-navy-900">
          {label} {required && <span className="text-status-danger">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, "min-h-[120px]", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClasses, className)} {...props}>
      {children}
    </select>
  );
}

export function InputLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="text-sm font-semibold text-navy-900" {...props} />;
}
