import * as React from "react";

export type WaterStep = { label: string; ms: number };

export default function WaterfallChart({
  steps,
  title = "Latency Waterfall",
}: {
  steps: WaterStep[];
  title?: string;
}) {
  const clean = (steps || []).filter(s => s && s.ms > 0);
  if (!clean.length) return null;

  const total = clean.reduce((a, s) => a + s.ms, 0);
  const max = Math.max(total, ...clean.map(s => s.ms));

  const W = 520, H = 320, L = 120, R = 24, T = 24, B = 36;
  const vw = W - L - R, rowH = (H - T - B) / clean.length;

  const scaleX = (x: number) => L + (x / max) * vw;

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 shadow-sm backdrop-blur p-4">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        {/* Rows */}
        {clean.map((s, i) => {
          const y = T + i * rowH + 6;
          return (
            <g key={i}>
              {/* Label */}
              <text
                x={L - 8}
                y={y + rowH / 2 - 6}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-neutral-700 text-[12px]"
              >
                {s.label}
              </text>

              {/* Track */}
              <rect
                x={L}
                y={y}
                width={vw}
                height={rowH - 12}
                rx={6}
                className="fill-neutral-200/70"
              />

              {/* Value bar */}
              <rect
                x={L}
                y={y}
                width={Math.max(4, (s.ms / max) * vw)}
                height={rowH - 12}
                rx={6}
                className="fill-purple-500/80"
              />

              {/* Value text */}
              <text
                x={scaleX(s.ms) + 8}
                y={y + (rowH - 12) / 2}
                dominantBaseline="middle"
                className="fill-neutral-700 text-[11px]"
              >
                {s.ms} ms
              </text>
            </g>
          );
        })}

        {/* X axis label */}
        <text
          x={L + vw / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-neutral-600 text-[11px]"
        >
          Time (ms)
        </text>
      </svg>
    </div>
  );
}
