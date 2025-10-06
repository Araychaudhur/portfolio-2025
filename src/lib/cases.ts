// src/lib/cases.ts
import fg from "fast-glob";
import matter from "gray-matter";
import path from "node:path";
import fs from "node:fs/promises";

/** Small labeled stat used in the hero section. */
export type Stat = { label: string; value: string; hint?: string };

/** Waterfall step (delta in ms). */
export type WaterfallItem = { label: string; deltaMs: number; hint?: string };

/** Latency percentiles (ms). */
export type Percentiles = { p50: number; p95: number };

/** Cost–quality frontier point. `current` highlights the chosen operating point. */
export type FrontierPoint = { label: string; cost: number; quality: number; current?: boolean };

/** Simple SLO item (kept minimal here; full gauge props live in UI components). */
export type SLO = { label: string; current: number; target: number; unit?: string };

/** Frontmatter contract for MDX case studies (author-controlled). */
export type CaseFrontmatter = {
  slug: string;
  title: string;
  subtitle: string;
  domain: "AI" | "Platform";
  outcomes: string[];           // e.g. ["Latency","Cost","Trust"]
  stack: string[];              // e.g. ["RAG","pgvector"]
  impactScore: number;          // used for "Impact" sort

  // Optional interactive replay
  hasReplay?: boolean;
  replaySrc?: string;           // /replays/<id>.json
  replayDurationSec?: number;   // 90

  // Optional visuals
  waterfall?: WaterfallItem[];
  percentiles?: Percentiles;
  frontier?: FrontierPoint[];
  slo?: SLO[];

  // Optional aside
  tldr?: string[];
  caption?: string;             // "After N changes over M weeks."

  // Optional cloud tagging variants (author may use any; meta is computed)
  cloud?: string[];             // preferred
  stackCloud?: string[];        // supported
  tags?: { cloud?: string[] };  // supported
};

/** Subset used on the index grid and filters. Includes computed `cloud`. */
export type CaseMeta = Pick<
  CaseFrontmatter,
  | "slug"
  | "title"
  | "subtitle"
  | "domain"
  | "outcomes"
  | "stack"
  | "impactScore"
  | "hasReplay"
  | "replayDurationSec"
> & {
  cloud: string[]; // computed from frontmatter or derived from stack
};

const ROOT = path.join(process.cwd(), "src", "content", "case-studies");

/** Normalize to a unique, trimmed string array. */
function asStringArray(x: unknown): string[] {
  if (Array.isArray(x)) return Array.from(new Set(x.map((s) => String(s).trim()).filter(Boolean)));
  if (typeof x === "string") {
    return Array.from(new Set(x.split(",").map((s) => s.trim()).filter(Boolean)));
  }
  return [];
}

/** Heuristic mapping from stack keywords to higher-level cloud tags. */
const CLOUD_MAP: Record<string, string> = {
  // keywords (lowercased) => normalized tag
  aws: "AWS",
  eks: "AWS",
  lambda: "AWS",
  s3: "AWS",
  rds: "AWS",
  dynamodb: "AWS",
  gcp: "GCP",
  bigquery: "GCP",
  vertex: "GCP",
  azure: "Azure",
  "app service": "Azure",
  "cosmos db": "Azure",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  vercel: "Vercel",
  cloudflare: "Cloudflare",
  workers: "Cloudflare",
  netlify: "Netlify",
  supabase: "Supabase",
};

function deriveCloudFromStack(stack: unknown): string[] {
  const s = asStringArray(stack);
  const out = new Set<string>();
  for (const item of s) {
    const low = item.toLowerCase();
    for (const key of Object.keys(CLOUD_MAP)) {
      if (low.includes(key)) out.add(CLOUD_MAP[key]);
    }
  }
  return Array.from(out);
}

/** Return all case slugs (without .mdx). */
export async function getAllCaseSlugs() {
  const files = await fg("*.mdx", { cwd: ROOT });
  return files.map((f) => path.basename(f, ".mdx"));
}

/** Read frontmatter from each case and return lightweight meta for the index grid. */
export async function getAllCaseMeta(): Promise<CaseMeta[]> {
  const files = await fg("*.mdx", { cwd: ROOT });
  const metas: CaseMeta[] = [];

  for (const f of files) {
    const full = path.join(ROOT, f);
    const raw = await fs.readFile(full, "utf8");
    const { data } = matter(raw);
    const fm = data as CaseFrontmatter;

    // 1) Pull cloud tags from any supported key, else derive from stack.
    const cloudFromFm =
      asStringArray(fm.cloud).length > 0
        ? asStringArray(fm.cloud)
        : asStringArray(fm.stackCloud).length > 0
        ? asStringArray(fm.stackCloud)
        : asStringArray(fm?.tags?.cloud).length > 0
        ? asStringArray(fm?.tags?.cloud)
        : deriveCloudFromStack(fm.stack);

    // 2) Build the meta object (defensive defaults preserved).
    metas.push({
      slug: String(fm.slug),
      title: String(fm.title),
      subtitle: String(fm.subtitle ?? ""),
      domain: (fm.domain as CaseFrontmatter["domain"]) ?? "AI",
      outcomes: asStringArray(fm.outcomes),
      stack: asStringArray(fm.stack),
      cloud: cloudFromFm,
      impactScore: Number.isFinite(fm.impactScore as number) ? (fm.impactScore as number) : 0,
      hasReplay: !!fm.hasReplay,
      replayDurationSec:
        fm.replayDurationSec != null && Number.isFinite(fm.replayDurationSec as number)
          ? (fm.replayDurationSec as number)
          : undefined,
    });
  }

  // Stable order by Impact (desc), then Title (asc).
  metas.sort((a, b) => (b.impactScore - a.impactScore) || a.title.localeCompare(b.title));
  return metas;
}

/** Fetch a single case by slug, returning typed frontmatter and the MDX body. */
export async function getCaseBySlug(
  slug: string
): Promise<{ frontmatter: CaseFrontmatter; body: string }> {
  const full = path.join(ROOT, `${slug}.mdx`);
  const raw = await fs.readFile(full, "utf8");
  const { data, content } = matter(raw);
  const fm = data as CaseFrontmatter;
  return { frontmatter: fm, body: content };
}
