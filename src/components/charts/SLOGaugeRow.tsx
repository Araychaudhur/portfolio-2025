'use client';

import * as React from 'react';

/** Values can be 0..1 or 0..100 when mode = "percent"; any number when mode = "raw". */
export type MetricInput = {
  label?: string;
  now: number;
  target: number;
  direction?: 'max' | 'min';        // default 'max'
  colorClass?: string;              // fill gradient class; default provided
  mode?: 'percent' | 'raw';         // default 'percent'
  unit?: string;                    // shown only when mode='raw', e.g., 'ms', 'req/s'
  decimals?: number;                // display precision for raw mode (default: 0 for ms, else 1)
};

export type SLOGaugeRowProps = {
  metrics?: MetricInput[];
  // Back-compat (still supported):
  availability?: MetricInput | null;
  errorRate?: MetricInput | null;
  title?: string;
};

export default function SLOGaugeRow(props: SLOGaugeRowProps) {
  const title = props.title ?? 'SLO Gauges';

  let metrics: MetricInput[] = (props.metrics || []).filter(Boolean);
  if (metrics.length === 0) {
    if (props.availability) metrics.push({ label: 'Availability', ...props.availability });
    if (props.errorRate) metrics.push({ label: 'Error rate', ...props.errorRate });
  }
  if (metrics.length === 0) return null;

  const isOne = metrics.length === 1;
  const cols =
    isOne ? 'grid-cols-1 place-items-center'
          : metrics.length === 2 ? 'grid-cols-2'
          : 'grid-cols-2 lg:grid-cols-3';

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/60 shadow-sm backdrop-blur p-4 sm:p-5">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <div className={`grid gap-6 ${cols}`}>
        {metrics.map((m, i) => (
          <GoalMeter
            key={`${m.label ?? 'metric'}-${i}`}
            m={m}
            colorClass={m.colorClass ?? 'bg-gradient-to-r from-violet-500 to-indigo-500'}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------ internals ------------------ */

function GoalMeter({ m, colorClass }: { m: MetricInput; colorClass: string }) {
  const label = m.label ?? 'Metric';
  const direction = m.direction === 'min' ? 'min' : 'max';
  const mode = m.mode ?? 'percent';

  // Raw values as provided (for display):
  const nowAbs = m.now;
  const targetAbs = m.target;

  // Ratio positions along the track (0..1).
  // - percent: accept 0..1 or 0..100 (normalize)
  // - raw: place NOW at  now/target  ; target tick at 1.0
  const rNow =
    mode === 'percent'
      ? normalizePercent(nowAbs)
      : clamp(nowAbs / Math.max(targetAbs, 1e-9), 0, 1);

  const progress = direction === 'max' ? rNow : 1 - rNow; // how close we are to goal

  // Track visuals
  const fillPct = (progress * 100).toFixed(0);
  const nowPct = rNow * 100;
  const targetPct = 100; // target is the end of the track

  // Format labels
  const displayNow = formatValue(nowAbs, mode, m.unit, m.decimals);
  const displayTarget = formatValue(targetAbs, mode, m.unit, m.decimals);

  return (
    <div className="w-full max-w-[560px]">
      <div className="text-center mb-2 text-sm text-neutral-600">{label}</div>

      <div className="text-center text-lg font-semibold mb-3">
        {displayNow} / {displayTarget}
      </div>

      <div className="relative h-3 rounded-full bg-neutral-200/80 overflow-hidden">
        {/* Filled progress (how close we are to the goal) */}
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${Number(fillPct)}%` }}
        />

        {/* Target tick (always at the end) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[2px] h-5 rounded bg-neutral-400/70"
          style={{ left: `${targetPct}%` }}
          aria-hidden
        />

        {/* Now marker (dot) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-600 shadow-sm"
          style={{ left: `calc(${nowPct}% - 6px)` }}
          aria-hidden
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
        <span>{direction === 'min' ? 'Lower is better' : 'Higher is better'}</span>
        <span>Progress: {fillPct}%</span>
      </div>
    </div>
  );
}

function normalizePercent(v: number) {
  // Accept 0..1 or 0..100
  return v > 1.5 ? clamp(v / 100, 0, 1) : clamp(v, 0, 1);
}

function formatValue(v: number, mode: 'percent' | 'raw', unit?: string, decimals?: number) {
  if (mode === 'percent') {
    return `${(v > 1.5 ? v : v * 100).toFixed(v > 1.5 ? 2 : 2)}%`;
  }
  // raw
  const d =
    decimals != null
      ? decimals
      : unit?.toLowerCase() === 'ms'
      ? 0
      : 1;
  return `${v.toFixed(d)}${unit ? ` ${unit}` : ''}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
