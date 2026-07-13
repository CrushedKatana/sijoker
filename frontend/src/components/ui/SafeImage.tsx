"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders an image with a graceful icon fallback when the source is missing
 * or fails to load (e.g. demo/seed data pointing at files that were never
 * uploaded to this environment).
 */
export function SafeImage({
  src,
  alt,
  className,
  fallbackIcon,
  fallbackClassName,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackIcon: React.ReactNode;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center text-navy-300",
          fallbackClassName
        )}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
