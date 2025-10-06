import * as React from "react";

export type FrontierPoint = {
  label: string;
  cost: number;     // relative cost (any positive numeric scale)
  quality: number;  // relative quality (0..1 or any numeric scale)
};

export default function CostQualityFrontier({
  points,
  title = "Cost → Quality Frontier",
}: {
  points: FrontierPoint[];
  title?: string;
}) {
  if (!points?.length) return null;

  // Compute domains with a little padding so dots never touch edges
  const xs = points.map(p => p.cost);
  const ys = points.map(p => p.quality);
  const min = (a: number[]) => Math.min(...a);
  const max = (a: number[]) => Math.max(...a);

  const xMin = min(xs), xMax = max(xs);
  const yMin = min(ys), yMax = max(ys);
  const pad = 0.1;

  const x0 = xMin - (xMax - xMin) * pad;
  const x1 = xMax + (xMax - xMin) * pad || xMax + 1;
  const y0 = yMin - (yMax - yMin) * pad;
  const y1 = yMax + (yMax - yMin) * pad || yMax + 1;

  const W = 520, H = 320, L = 52, B = 36, R = 24, T = 24;
  const vw = W - L - R, vh = H - T - B;

  const scaleX = (x: number) => L + ((x - x0) / (x1 - x0)) * vw;
  const scaleY = (y: number) => T + (1 - (y - y0) / (y1 - y0)) * vh;

  // Ticks (4 each side)
  const ticks = (n: number) => Array.from({ length: n }, (_, i) => i / (n - 1));
  const xTicks = ticks(4).map(t => x0 + t * (x1 - x0));
  const yTicks = ticks(4).map(t => y0 + t * (y1 - y0));

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 shadow-sm backdrop-blur p-4">
      <div className="mb-2 text-sm font-medium">{title}</div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img">
        {/* Axes */}
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgba(0,0,0,.18)" />
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="rgba(0,0,0,.18)" />

        {/* Grid + ticks */}
        {yTicks.map((v, i) => (
          <g key={`yt-${i}`}>
            <line
              x1={L}
              y1={scaleY(v)}
              x2={W - R}
              y2={scaleY(v)}
              stroke="rgba(0,0,0,.06)"
            />
            <text
              x={L - 8}
              y={scaleY(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-neutral-500 text-[10px]"
            >
              {roundNice(v)}
            </text>
          </g>
        ))}
        {xTicks.map((v, i) => (
          <g key={`xt-${i}`}>
            <line
              x1={scaleX(v)}
              y1={H - B}
              x2={scaleX(v)}
              y2={T}
              stroke="rgba(0,0,0,.06)"
            />
            <text
              x={scaleX(v)}
              y={H - B + 12}
              textAnchor="middle"
              className="fill-neutral-500 text-[10px]"
            >
              {roundNice(v)}
            </text>
          </g>
        ))}

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={scaleX(p.cost)}
              cy={scaleY(p.quality)}
              r={6}
              className="fill-purple-600/90"
            />
            <text
              x={scaleX(p.cost) + 8}
              y={scaleY(p.quality) - 8}
              className="fill-neutral-700 text-[10px]"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text
          x={(L + (W - R)) / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-neutral-600 text-[11px]"
        >
          Cost
        </text>
        <text
          x={12}
          y={(T + (H - B)) / 2}
          transform={`rotate(-90, 12, ${(T + (H - B)) / 2})`}
          textAnchor="middle"
          className="fill-neutral-600 text-[11px]"
        >
          Quality
        </text>
      </svg>
    </div>
  );
}

function roundNice(v: number) {
  // Pretty short labels for relative numbers
  const abs = Math.abs(v);
  if (abs >= 1000) return (v / 1000).toFixed(1) + "k";
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  return v.toFixed(2);
}
