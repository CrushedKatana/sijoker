import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-9 w-9", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 3 L43 11 V26 C43 36 35 43 24 46 C13 43 5 36 5 26 V11 Z"
        fill="#0b1a35"
        stroke="#f5a524"
        strokeWidth="2"
      />
      <path
        d="M18 15 H30 M18 15 V22 H27 V32 H16"
        stroke="#f5a524"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  variant = "dark",
  tagline,
  className,
}: {
  variant?: "dark" | "light";
  tagline?: string;
  className?: string;
}) {
  const textColor = variant === "dark" ? "text-navy-950" : "text-white";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <div className="leading-tight">
        <p className={cn("text-lg font-extrabold tracking-tight", textColor)}>
          Si<span className="text-brand-orange-500">J</span>ker
        </p>
        {tagline && <p className="text-[11px] font-medium text-slate-400">{tagline}</p>}
      </div>
    </div>
  );
}
