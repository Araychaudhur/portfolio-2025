/* eslint-disable no-console */

// scripts/embed.ts — FINAL
// Indexes MDX case studies, Replay JSON steps, and optional Profile JSON into Supabase.
// - Anchored URLs: /case-studies/[slug]#<heading>  and  /profile#<track>-<id>
// - Purges stale rows for each base URL before upserting
// - Batches embeddings + upserts
// - ❗ Dedupes rows by (url, heading) to avoid ON CONFLICT double-hit

import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { config as loadEnv } from "dotenv";
import fg from "fast-glob";
import matter from "gray-matter";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Only index the case studies listed in the final runbook
const ALLOWED_SLUGS = new Set([
  "api-reliability-dx",
  "blue-green-8-services",
  "cost-latency-vllm",
  "eval-harness",
  "fastapi-productization",
  "launchpad-saas",
  "observability-program",
  "onnx-efficiency",
  "opsseer-aiops",
  "orchestration-langgraph",
  "rag-at-scale",
  "safety-privacy",
]);

const ROOT = process.cwd();
const envLocal = path.resolve(ROOT, ".env.local");
if (fs.existsSync(envLocal)) loadEnv({ path: envLocal }); else loadEnv();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MODEL_EMBED = "text-embedding-3-small"; // 1536-dim
const CONTENT_DIR = path.resolve(ROOT, "src", "content", "case-studies");
const REPLAYS_DIR = path.resolve(ROOT, "public", "replays");
const PROFILE_DIR = path.resolve(ROOT, "public", "profile");
const MAX_SECTION_CHARS = 4000;
const BATCH = 64;

type Row = { url: string; heading: string; content: string };

function slugify(input: string) {
  return (input || "")
    .toString()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function listFiles(dir: string, pattern = "**/*.{md,mdx}") {
  if (!fs.existsSync(dir)) return [];
  return await fg(pattern, { cwd: dir, dot: false, onlyFiles: true, absolute: true });
}

// Split MD/MDX by headings (## and deeper). Pre-heading content becomes “Introduction”.
function mdToSections(md: string): { heading: string; content: string }[] {
  const src = md.replace(/\r\n/g, "\n");
  const stripped = src.replace(/```[\s\S]*?```/g, ""); // strip code fences
  const lines = stripped.split("\n");

  const out: { heading: string; content: string }[] = [];
  let currentH = "Introduction";
  let buf: string[] = [];
  const flush = () => {
    const body = buf.join("\n").trim();
    if (body.length > 0 && body.replace(/\s+/g, " ").length > 20) {
      out.push({ heading: currentH.trim(), content: body.slice(0, MAX_SECTION_CHARS) });
    }
    buf = [];
  };

  for (const line of lines) {
    const m = /^\s{0,3}(#{2,6})\s+(.+?)\s*$/.exec(line);
    if (m) { flush(); currentH = m[2]; } else { buf.push(line); }
  }
  flush();
  return out;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await openai.embeddings.create({ model: MODEL_EMBED, input: texts });
  return res.data.map((d) => d.embedding as number[]);
}

async function upsertRows(rows: Row[]) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const embeddings = await embedBatch(slice.map((r) => `${r.heading}\n\n${r.content}`));
    const payload = slice.map((r, idx) => ({
      url: r.url,
      heading: r.heading,
      content: r.content,
      embedding: embeddings[idx],
    }));
    const { error } = await supabase.from("documents").upsert(payload, { onConflict: "url,heading" });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    console.log(`  • upserted ${payload.length}`);
  }
}

async function purgeByBases(bases: string[]) {
  const uniq = Array.from(new Set(bases));
  for (const base of uniq) {
    const { error } = await supabase.from("documents").delete().like("url", `${base}%`);
    if (error) console.warn(`! purge warning for ${base}: ${error.message}`);
    else console.log(`  • purged ${base}*`);
  }
}

// ❗ Deduplicate on (url, heading). Prefer the longer content.
function dedupeRows(rows: Row[]): Row[] {
  const map = new Map<string, Row>();
  for (const r of rows) {
    const key = `${r.url}||${r.heading}`;
    const prev = map.get(key);
    if (!prev) map.set(key, r);
    else if ((r.content?.length ?? 0) > (prev.content?.length ?? 0)) map.set(key, r);
  }
  return Array.from(map.values());
}

// ────────────────────────────────────────────────────────────
// 1) Index MDX case studies (src/content/case-studies/*.mdx)
// ────────────────────────────────────────────────────────────
async function indexCaseStudies(): Promise<Row[]> {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log("· Skipping MDX: src/content/case-studies not found.");
    return [];
  }
  const files = await listFiles(CONTENT_DIR, "*.mdx");
  const rows: Row[] = [];

  for (const abs of files) {
    const raw = await fsp.readFile(abs, "utf8");
    const { data, content } = matter(raw); // index only the body
    const slug = String((data as any)?.slug || path.basename(abs, ".mdx"));
    if (!ALLOWED_SLUGS.has(slug)) {
      console.log(`· Skipping MDX not in runbook: ${slug}`);
      continue;
    }
    const baseUrl = `/case-studies/${slug}`;

    const sections = mdToSections(content);
    for (const s of sections) {
      const anchor = slugify(s.heading);
      rows.push({ url: `${baseUrl}#${anchor}`, heading: s.heading, content: s.content });
    }
    console.log(`· Case MDX parsed: ${baseUrl} (+${sections.length})`);
  }
  return rows;
}

// ────────────────────────────────────────────────────────────
// 2) Index Replay JSON steps (public/replays/*.json)
// ────────────────────────────────────────────────────────────
async function indexReplays(): Promise<Row[]> {
  if (!fs.existsSync(REPLAYS_DIR)) {
    console.log("· Skipping Replay: public/replays not found.");
    return [];
  }
  const files = await listFiles(REPLAYS_DIR, "*.json");
  const rows: Row[] = [];

  for (const abs of files) {
    let j: any;
    try { j = JSON.parse(await fsp.readFile(abs, "utf8")); }
    catch { console.warn(`! Skipped invalid replay JSON: ${path.basename(abs)}`); continue; }

    const slug: string = j.slug || path.basename(abs, ".json");
    if (!slug) continue;
    const baseUrl = `/case-studies/${slug}`;
    const steps = Array.isArray(j.steps) ? j.steps : [];

    for (const step of steps) {
      const label = String(step.label || step.id || "Step");
      const id = String(step.id || slugify(label));
      const metrics = Array.isArray(step.metrics)
        ? step.metrics.map((m: any) => `${m.name}: ${m.before}${m.unit ?? ""} → ${m.after}${m.unit ?? ""}`).join("; ")
        : "";
      const body = String(step.body || "");
      const content = [label, body, metrics].filter(Boolean).join("\n").slice(0, MAX_SECTION_CHARS);

      rows.push({ url: `${baseUrl}#${id}`, heading: label, content });
    }
    console.log(`· Replay parsed: ${baseUrl} (+${rows.filter(r => r.url.startsWith(baseUrl)).length})`);
  }
  return rows;
}

// ────────────────────────────────────────────────────────────
// 3) (Optional) Index Profile JSON (public/profile/*.json)
// ────────────────────────────────────────────────────────────
async function indexProfiles(): Promise<Row[]> {
  if (!fs.existsSync(PROFILE_DIR)) {
    console.log("· Skipping Profiles: public/profile not found.");
    return [];
  }
  const files = await listFiles(PROFILE_DIR, "*.json");
  const rows: Row[] = [];

  for (const abs of files) {
    let j: any;
    try { j = JSON.parse(await fsp.readFile(abs, "utf8")); }
    catch { console.warn(`! Skipped invalid profile JSON: ${path.basename(abs)}`); continue; }

    const track: string = j.track || path.basename(abs, ".json"); // e.g., "ai" | "sde"
    const baseUrl = `/profile#${slugify(track)}`;
    const steps = Array.isArray(j.steps) ? j.steps : [];

    for (const step of steps) {
      const label = String(step.label || step.id || "Step");
      const id = String(step.id || slugify(label));
      const skills = Array.isArray(step.skills) ? `skills: ${step.skills.join(", ")}` : "";
      const metrics = Array.isArray(step.metrics)
        ? step.metrics.map((m: any) => `${m.name}: ${m.before}${m.unit ?? ""} → ${m.after}${m.unit ?? ""}`).join("; ")
        : "";
      const body = String(step.body || "");
      const content = [label, body, skills, metrics].filter(Boolean).join("\n").slice(0, MAX_SECTION_CHARS);

      rows.push({ url: `${baseUrl}-${id}`, heading: label, content });
    }
    console.log(`· Profile parsed: ${baseUrl} (+${rows.filter(r => r.url.startsWith(baseUrl)).length})`);
  }
  return rows;
}

// ────────────────────────────────────────────────────────────
// 4) Main
// ────────────────────────────────────────────────────────────
(async () => {
  console.log("▶ Embedding start");
  console.log(`  • Model: ${MODEL_EMBED}`);
  console.log(`  • Cases dir: ${fs.existsSync(CONTENT_DIR) ? CONTENT_DIR : "(missing)"}`);
  console.log(`  • Replays dir: ${fs.existsSync(REPLAYS_DIR) ? REPLAYS_DIR : "(missing)"}`);
  console.log(`  • Profile dir: ${fs.existsSync(PROFILE_DIR) ? PROFILE_DIR : "(missing)"}`);

  const t0 = Date.now();

  const caseRows = await indexCaseStudies();
  const replayRows = await indexReplays();
  const profileRows = await indexProfiles();

  let all = [...caseRows, ...replayRows, ...profileRows];
  if (all.length === 0) { console.log("Nothing to index."); process.exit(0); }

  // ❗ Deduplicate BEFORE purge/upsert to avoid ON CONFLICT double-hit
  const before = all.length;
  all = dedupeRows(all);
  const removed = before - all.length;
  if (removed > 0) console.log(`· Deduped ${removed} duplicate rows on (url, heading)`);

  // Purge rows for bases present in this run (everything before '#')
  const bases = Array.from(new Set(all.map((r) => r.url.split("#")[0])));
  console.log(`· Purging stale rows for ${bases.length} bases…`);
  await purgeByBases(bases);

  console.log(`· Embedding + upserting ${all.length} rows in batches of ${BATCH}…`);
  await upsertRows(all);

  const ms = Date.now() - t0;
  console.log(`✓ Done. Indexed ${all.length} chunks in ${Math.round(ms / 1000)}s.`);
  process.exit(0);
})().catch((e) => {
  console.error("✖ Embed failed:", e?.message || e);
  process.exit(1);
});
