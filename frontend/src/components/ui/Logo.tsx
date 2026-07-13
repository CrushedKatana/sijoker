import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const img = (
    <Image
      src="/logo/logo-mark.png"
      alt="Logo"
      width={226}
      height={320}
      priority
      className={cn(className ?? "h-9 w-auto", "object-contain")}
    />
  );
  if (!onDark) return img;
  return (
    <span className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
      {img}
    </span>
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
  const onDark = variant === "light";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center",
          onDark && "rounded-xl bg-white px-3 py-1.5 shadow-sm"
        )}
      >
        <Image
          src="/logo/logo-full.png"
          alt="Si Joker"
          width={778}
          height={320}
          priority
          className="h-8 w-auto object-contain"
        />
      </span>
      {tagline && (
        <p className={cn("text-[11px] font-medium", onDark ? "text-slate-300" : "text-slate-400")}>
          {tagline}
        </p>
      )}
    </div>
  );
}
