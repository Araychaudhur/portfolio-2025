import * as React from "react";

/**
 * Renders an approximate latency histogram from p50/p95 using a log-normal fit.
 * Units are milliseconds.
 */
export default function LatencyDistribution({
  p50,
  p95,
  title = "Latency Distribution",
}: {
  p50: number;
  p95: number;
  title?: string;
}) {
  if (!p50 || !p95 || p95 <= 0 || p50 <= 0) return null;

  // Fit log-normal: median = exp(mu), 95th = exp(mu + 1.64485 * sigma)
  const mu = Math.log(p50);
  const sigma = (Math.log(p95) - mu) / 1.64485;
  const xmax = Math.max(p95 * 1.5, p50 * 3); // generous right bound

  // Build 24 bins
  const bins = 24;
  const xs: number[] = [];
  for (let i = 0; i < bins; i++) xs.push((xmax / bins) * (i + 1));

  function pdf(x: number) {
    // log-normal PDF
    const denom = x * sigma * Math.sqrt(2 * Math.PI);
    const expo = -Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma);
    return Math.exp(expo) / denom;
  }

  const ys = xs.map(pdf);
  const yMax = Math.max(...ys);

  // SVG
  const W = 520, H = 320, L = 40, R = 16, T = 24, B = 36;
  const vw = W - L - R, vh = H - T - B;
  const scaleX = (x: number) => L + (x / xmax) * vw;
  const scaleY = (y: number) => T + (1 - y / yMax) * vh;

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 shadow-sm backdrop-blur p-4">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        {/* Axis */}
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="rgba(0,0,0,.18)" />
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgba(0,0,0,.18)" />

        {/* Bars */}
        {xs.map((x, i) => {
          const y = ys[i];
          const w = vw / bins - 2;
          const h = vh * (y / yMax);
          const x0 = scaleX(x) - (vw / bins) + 1;
          const y0 = H - B - h;
          return (
            <rect
              key={i}
              x={x0}
              y={y0}
              width={w}
              height={h}
              rx={2}
              className="fill-purple-500/35"
            />
          );
        })}

        {/* p50 / p95 markers */}
        {[{x:p50,label:`p50 ${p50}ms`},{x:p95,label:`p95 ${p95}ms`}].map((m, i) => (
          <g key={i}>
            <line
              x1={scaleX(m.x)}
              y1={T}
              x2={scaleX(m.x)}
              y2={H - B}
              className="stroke-purple-600/50"
              strokeDasharray="4 4"
            />
            <text
              x={scaleX(m.x) + 4}
              y={T + 12}
              className="fill-neutral-700 text-[10px]"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* X label */}
        <text
          x={(L + (W - R)) / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-neutral-600 text-[11px]"
        >
          Latency (ms)
        </text>
      </svg>
    </div>
  );
}
