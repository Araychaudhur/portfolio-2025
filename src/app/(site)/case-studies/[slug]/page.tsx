import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllCaseSlugs, getCaseBySlug } from "@/lib/cases";
import { StatTiles } from "@/components/StatTiles";
import StickyAside from "@/components/StickyAside";
import ReplaySkeleton from "@/components/ReplaySkeleton";

// Charts (unchanged imports)
import WaterfallChart from "@/components/charts/WaterfallChart";
import LatencyDistribution from "@/components/charts/LatencyDistribution";
import CostQualityFrontier from "@/components/charts/CostQualityFrontier";
import SLOGaugeRow, { type MetricInput } from "@/components/charts/SLOGaugeRow";

import StackEnvironmentChips from "@/components/case/StackEnvironmentChips";

// Lazy replay player (keeps TBT low while preserving SSR/Suspense)
const ReplayPlayer = dynamic(
  () => import("@/components/ReplayPlayer").then((m) => m.ReplayPlayer),
  { ssr: true, suspense: true }
);

// ----------------------------------------------------
// Static params / metadata
// ----------------------------------------------------
export async function generateStaticParams() {
  const slugs = await getAllCaseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getCaseBySlug(params.slug).catch(() => null);
  if (!data) return {};
  const fm = data.frontmatter as any;
  return {
    title: `${fm.title} — Case Study`,
    description: fm.subtitle ?? undefined,
  };
}

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

function sloFromFrontmatter(fm: any): MetricInput[] {
  const arr = Array.isArray(fm?.slo?.metrics) ? fm.slo.metrics : [];
  const metrics: MetricInput[] = arr
    .map((m: any) => {
      const now = m?.now ?? m?.current ?? m?.value;
      const target = m?.target;
      if (now == null || target == null) return null;

      return {
        label: m.label,
        now,
        target,
        direction: m.direction === "min" ? "min" : "max",
        colorClass: m.colorClass,
        mode: m.mode === "raw" ? "raw" : "percent",
        unit: m.unit,
        decimals: typeof m.decimals === "number" ? m.decimals : undefined,
      } as MetricInput;
    })
    .filter(Boolean) as MetricInput[];

  if (metrics.length) return metrics;

  // Legacy fallbacks:
  const legacy: MetricInput[] = [];
  if (fm?.slo?.availability) {
    legacy.push({
      label: fm.slo.availability.label ?? "Availability",
      now: fm.slo.availability.now,
      target: fm.slo.availability.target,
      direction: "max",
      mode: "percent",
    });
  }
  if (fm?.slo?.errorRate) {
    legacy.push({
      label: fm.slo.errorRate.label ?? "Error rate",
      now: fm.slo.errorRate.now,
      target: fm.slo.errorRate.target,
      direction: "min",
      mode: "percent",
    });
  }
  return legacy;
}

function percentilesFromFrontmatter(fm: any): { p50: number; p95: number } | null {
  const p = fm?.percentiles;
  if (!p) return null;
  const p50 = Number(p.p50);
  const p95 = Number(p.p95);
  if (!isFinite(p50) || !isFinite(p95)) return null;
  return { p50, p95 };
}

type WaterStep = { label: string; ms: number };
function waterfallFromFrontmatter(fm: any): WaterStep[] {
  const arr = Array.isArray(fm?.waterfall) ? fm.waterfall : [];
  return arr
    .map((s: any) => {
      if (!s) return null;
      const label = String(s.label ?? "");
      const ms = Number(s.ms);
      if (!label || !isFinite(ms)) return null;
      return { label, ms } as WaterStep;
    })
    .filter(Boolean) as WaterStep[];
}

type FrontierPoint = { label: string; cost: number; quality: number };
function frontierFromFrontmatter(fm: any): FrontierPoint[] {
  const arr = Array.isArray(fm?.frontier) ? fm.frontier : [];
  return arr
    .map((p: any) => {
      if (!p) return null;
      const label = String(p.label ?? "");
      const cost = Number(p.cost);
      const quality = Number(p.quality);
      if (!label || !isFinite(cost) || !isFinite(quality)) return null;
      return { label, cost, quality } as FrontierPoint;
    })
    .filter(Boolean) as FrontierPoint[];
}

// Build soft histogram buckets from p50/p95 (legacy support for existing LatencyDistribution prop)
function buildBucketsFrom(p50: number, p95: number) {
  return [
    { ms: Math.round(p50 * 0.5), count: 6 },
    { ms: Math.round(p50 * 0.8), count: 12 },
    { ms: p50, count: 16 },
    { ms: Math.round((p50 + p95) / 2), count: 10 },
    { ms: p95, count: 6 },
  ];
}

// ----------------------------------------------------
// Page
// ----------------------------------------------------
export default async function CasePage({ params }: { params: { slug: string } }) {
  const data = await getCaseBySlug(params.slug).catch(() => null);
  if (!data) return notFound();

  const fm: any = data.frontmatter;
  const sloMetrics = sloFromFrontmatter(fm);

  // New dynamic shapes (with graceful nulls)
  const pct = percentilesFromFrontmatter(fm);
  const steps = waterfallFromFrontmatter(fm);
  const frontier = frontierFromFrontmatter(fm);

  // Resolve cloud tags from any supported key in frontmatter
const cloud: string[] =
  Array.isArray(fm.cloud) ? fm.cloud :
  Array.isArray(fm.stackCloud) ? fm.stackCloud :
  Array.isArray(fm.tags?.cloud) ? (fm.tags!.cloud as string[]) :
  [];

  // Legacy fallbacks for charts that still expect older props
  const legacyBuckets = pct ? buildBucketsFrom(pct.p50, pct.p95) : undefined;
  const legacyItems = Array.isArray(fm?.waterfall) ? fm.waterfall : undefined;
  const legacyTotal = fm?.percentiles?.p95;

  return (
    <main className="container py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <section>
          <h1 className="text-3xl font-semibold">{fm.title}</h1>
          {fm.subtitle ? <p className="mt-2 text-muted">{fm.subtitle}</p> : null}

          {/* Hero tiles */}
          {Array.isArray(fm.heroStats) && fm.heroStats.length > 0 ? (
            <div className="mt-6">
              <StatTiles items={fm.heroStats} />
              {fm.caption ? (
                <p className="mt-2 text-xs text-muted">{fm.caption}</p>
              ) : null}
            </div>
          ) : null}
          <StackEnvironmentChips stack={fm.stack} cloud={cloud} />

          {/* Charts (each card renders only when data exists) */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Waterfall */}
            {steps && steps.length > 0 ? (
              <WaterfallChart
                {...({
                  // new API
                  steps,
                  // legacy props (ignored by new component, used by older one)
                  items: legacyItems,
                  totalMs: legacyTotal,
                } as any)}
              />
            ) : null}

            {/* Latency distribution */}
            {pct ? (
              <LatencyDistribution
                {...({
                  // new API
                  p50: pct.p50,
                  p95: pct.p95,
                  // legacy buckets
                  buckets: legacyBuckets,
                } as any)}
              />
            ) : null}

            {/* Cost→Quality frontier */}
            {frontier && frontier.length > 0 ? (
              <CostQualityFrontier
                {...({
                  // new API
                  points: frontier,
                } as any)}
              />
            ) : null}

            {/* SLO Gauges */}
            {sloMetrics.length > 0 ? <SLOGaugeRow metrics={sloMetrics} /> : null}
          </div>

          {/* Replay (optional) */}
          {fm.hasReplay && fm.replaySrc ? (
            <div className="mt-8" id="replay">
              {/* @ts-expect-error Async Server Component + Suspense boundary */}
              <ReplayPlayer src={fm.replaySrc} fallback={<ReplaySkeleton />} />
            </div>
          ) : null}

          {/* MDX narrative */}
          <article className="prose prose-invert mt-10 max-w-none">
            <MDXRemote source={data.body} />
          </article>
        </section>

        {/* Sticky “TL;DR” aside */}
        {Array.isArray(fm.tldr) && fm.tldr.length > 0 ? (
          <StickyAside bullets={fm.tldr} />
        ) : null}
      </div>
    </main>
  );
}
