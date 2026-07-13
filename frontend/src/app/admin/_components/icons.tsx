// Minimal inline stroke icons for the admin sidebar nav. No icon library is
// installed, so these are small hand-rolled SVGs kept visually consistent
// (20x20 viewBox, 1.8 stroke, rounded caps).

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconDashboard({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" />
    </svg>
  );
}

export function IconBriefcase({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="6" width="15" height="10.5" rx="1.5" />
      <path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6" />
      <path d="M2.5 11h15" />
    </svg>
  );
}

export function IconChartBar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 17V9M9 17V3M15 17v-6" />
      <path d="M2.5 17.5h15" />
    </svg>
  );
}

export function IconNewspaper({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="4" width="11" height="12" rx="1.2" />
      <path d="M13.5 7.5H16A1.5 1.5 0 0 1 17.5 9v6a1.5 1.5 0 0 1-1.5 1.5H6" />
      <path d="M5.2 7.3h5M5.2 10.2h5M5.2 13.1h3" />
    </svg>
  );
}

export function IconChat({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 4.5h14a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H8l-3.8 3V14H3a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function IconFolder({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 6a1.5 1.5 0 0 1 1.5-1.5h3.5l1.5 1.8H16A1.5 1.5 0 0 1 17.5 7.8v7.2A1.5 1.5 0 0 1 16 16.5H4A1.5 1.5 0 0 1 2.5 15V6Z" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="7" cy="6.5" r="2.5" />
      <path d="M2.5 16c0-2.5 2-4.2 4.5-4.2s4.5 1.7 4.5 4.2" />
      <circle cx="14.2" cy="7.2" r="2" />
      <path d="M13 11.9c1.9.3 3.5 1.8 3.5 4.1" />
    </svg>
  );
}

export function IconAcademicCap({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2 7.5 10 4l8 3.5-8 3.5-8-3.5Z" />
      <path d="M5.5 9.3v3.4c0 1.2 2 2.3 4.5 2.3s4.5-1.1 4.5-2.3V9.3" />
      <path d="M17 8v4.5" />
    </svg>
  );
}

export function IconClipboard({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="3.5" width="12" height="14" rx="1.5" />
      <rect x="7" y="2.2" width="6" height="2.6" rx="1" />
      <path d="M7 9h6M7 12h6M7 15h3.5" />
    </svg>
  );
}

export function IconUserCog({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="7" cy="6" r="3" />
      <path d="M2.2 16.5c0-3 2.2-5 4.8-5" />
      <circle cx="14.5" cy="12.5" r="3" />
      <path d="M14.5 8.2v.9M14.5 15.9v.9M18 12.5h-.9M11.9 12.5H11M16.7 9.7l-.6.6M12.9 15.1l-.6.6M16.7 15.3l-.6-.6M12.9 9.9l-.6-.6" />
    </svg>
  );
}
