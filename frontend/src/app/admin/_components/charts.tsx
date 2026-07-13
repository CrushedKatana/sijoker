"use client";

import { useId, useState } from "react";
import type { DailyPoint } from "@/lib/types";

// Categorical palette validated for CVD-safety + light-surface contrast via the
// dataviz skill's validator (blue, aqua, yellow, violet, magenta — fixed order).
export const CHART_COLORS = ["#2a78d6", "#1baf7a", "#eda100", "#4a3aa7", "#e87ba4"];

/**
 * A single-series line/area chart, built with plain SVG. Ships a hover
 * crosshair + tooltip per the dataviz interaction guidance.
 */
export function LineAreaChart({ points }: { points: DailyPoint[] }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const width = 560;
  const height = 220;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 36;
  const padRight = 8;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const values = points.map((p) => p.value);
  const maxV = Math.max(1, ...values);
  const niceMax = Math.ceil(maxV / 5) * 5 || 5;

  const x = (i: number) => padLeft + (points.length <= 1 ? 0 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => padTop + plotH - (v / niceMax) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
  const areaPath = `${linePath} L ${x(points.length - 1)} ${padTop + plotH} L ${x(0)} ${padTop + plotH} Z`;

  const ticks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Grafik kunjungan harian">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity="0.25" />
            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={padLeft} x2={width - padRight} y1={y(t)} y2={y(t)} stroke="#e1e0d9" strokeWidth={1} />
            <text x={padLeft - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#898781">
              {Math.round(t)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke={CHART_COLORS[0]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={p.label + i}>
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={hover === i ? 5 : 3.5}
              fill="#fff"
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((h) => (h === i ? null : h))}
              style={{ cursor: "pointer" }}
            />
            {hover === i && (
              <line x1={x(i)} x2={x(i)} y1={padTop} y2={padTop + plotH} stroke={CHART_COLORS[0]} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
            )}
            <text x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="#52514e">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-navy-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg"
          style={{
            left: `${(x(hover) / width) * 100}%`,
            top: `${(y(points[hover].value) / height) * 100}%`,
          }}
        >
          {points[hover].label}: {points[hover].value}
        </div>
      )}
    </div>
  );
}

/**
 * A horizontal bar chart for a small set of categorical values. Direct value
 * labels are always shown (relief channel required by the palette's contrast
 * WARN on a couple of slots).
 */
export function HorizontalBarChart({ data }: { data: DailyPoint[] }) {
  const maxV = Math.max(1, ...data.map((d) => d.value));
  const niceMax = Math.ceil(maxV / 90) * 90 || 90;
  const axisTicks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];

  return (
    <div>
      <div className="space-y-3">
        {data.map((d, i) => {
          const pct = Math.max(4, (d.value / niceMax) * 100);
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div key={d.label} className="flex items-center gap-3">
              <div className="w-24 shrink-0 truncate text-sm text-navy-900" title={d.label}>
                {d.label}
              </div>
              <div className="relative h-8 flex-1 rounded-md bg-navy-50">
                <div
                  className="flex h-8 items-center justify-end rounded-md px-2 text-xs font-semibold text-white"
                  style={{ width: `${pct}%`, backgroundColor: color, minWidth: "2.5rem" }}
                >
                  {d.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between pl-[6.5rem] text-xs text-slate-400">
        {axisTicks.map((t) => (
          <span key={t}>{Math.round(t)}</span>
        ))}
      </div>
    </div>
  );
}
