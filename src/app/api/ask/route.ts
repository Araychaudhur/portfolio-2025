import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Tiny JSON helper (avoids top-level throws) */
function json(data: unknown, init?: number | ResponseInit) {
  const status = typeof init === "number" ? init : (init as ResponseInit)?.status ?? 200;
  const headers = new Headers((typeof init === "number" ? undefined : init)?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...(typeof init === "number" ? {} : (init as ResponseInit)), status, headers });
}

/** Constants (same defaults you had) */
const MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const RPC = "match_documents_arr";
const MAX_SNIPPETS = 12;
const TAKE = 4;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const q = String(body?.question || body?.q || "").trim();
  return handleAsk(q);
}

/** Health check so cold pings don’t fail */
export async function GET() {
  return json({ ok: true });
}

/** Main logic (same flow, clients created lazily) */
async function handleAsk(question: string) {
  if (!question) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  // ---- 0) Guard env (don’t throw at module load) ----
  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey) return json({ error: "Missing OPENAI_API_KEY" }, 500);
  if (!supabaseUrl) return json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, 500);
  if (!supabaseServiceKey) return json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, 500);

  // ---- 1) Create clients lazily (prevents build-time crash) ----
  const openai = new OpenAI({ apiKey });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ---- 2) Embed query (same model you used) ----
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const query_embedding = emb.data[0].embedding as number[];

  // ---- 3) Vector search via array RPC ----
  const { data: matches, error } = await supabase.rpc(RPC, {
    query_embedding,
    match_count: MAX_SNIPPETS,
  });

  if (error) {
    return NextResponse.json({ error: `Search failed: ${error.message}` }, { status: 500 });
  }

  const rows = (matches || []) as Array<{
    url: string;
    heading: string;
    content: string;
    similarity?: number;
  }>;

  if (rows.length === 0) {
    return NextResponse.json({ answer: "I cant answer from the portfolio yet.", citations: [] });
  }

  // ---- 4) Heuristic re-rank (preserving your logic) ----
  const chosen = rerank(question, rows);

  // ---- 5) Prompt construction ----
  const contextBlocks = chosen
    .map((r, i) => `[#${i + 1}] ${r.heading || "(no heading)"}\nURL: ${r.url}\n---\n${r.content}`)
    .join("\n\n");

  const system = [
    "You answer strictly from the provided context (a portfolio site).",
    "If unsure, say you cannot answer from the portfolio yet.",
    "Cite with [#n] where n is the order in the context blocks.",
    "Keep answers short and to the point.",
  ].join(" ");

  // ---- 6) Chat completion ----
  const chat = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Question: ${question}\n\nContext:\n${contextBlocks}` },
    ],
  });

  const answer =
    chat.choices[0]?.message?.content?.trim() || "I cant answer from the portfolio yet.";
  const citations = chosen.map((r, i) => ({ ref: i + 1, url: r.url, heading: r.heading }));

  return NextResponse.json({ answer, citations });
}

/* ----------------------- helpers (kept from your approach) ----------------------- */

function slugFromUrl(u: string) {
  const m = /^\/case-studies\/([^#]+)/.exec(u || "");
  return m?.[1] || "";
}
function hashFromUrl(u: string) {
  const m = /#(.+)$/.exec(u || "");
  return m?.[1] || "";
}
function wantedSlug(question: string): string | "" {
  const q = question.toLowerCase();
  const m = /case\s+stud(y|ies)\s*[:\-]?\s*([a-z0-9\-]+)/.exec(q);
  return (m?.[2] || "").trim();
}
function wantsChanged(question: string) {
  const q = question.toLowerCase();
  return /what\s+changed|what\s+did\s+you\s+change/.test(q);
}

/** Keep your bias: prefer requested slug; boost “what changed” anchors; sort by similarity+boost */
function rerank(
  question: string,
  rows: Array<{ url: string; heading: string; content: string; similarity?: number }>
) {
  const preferred = wantedSlug(question);
  const wantsChange = wantsChanged(question);

  const onlyCases = rows.filter((r) => r.url?.startsWith("/case-studies/"));
  let pool = onlyCases.length ? onlyCases : rows;

  // If preferred slug appears anywhere, restrict pool to only that slug
  if (preferred && pool.some((r) => slugFromUrl(r.url) === preferred)) {
    pool = pool.filter((r) => slugFromUrl(r.url) === preferred);
  }

  const scored = pool.map((r) => {
    const slug = slugFromUrl(r.url);
    const h = String(r.heading || "").toLowerCase();
    const hash = hashFromUrl(r.url).toLowerCase();
    let score = Number(r.similarity) || 0;

    if (preferred && slug === preferred) score += 0.6;

    if (wantsChange) {
      if (h.includes("what") && h.includes("chang")) score += 0.25;
      if (hash.includes("what") && hash.includes("chang")) score += 0.25;
      if (preferred === "rag-at-scale" && (hash === "design" || hash.includes("what-changed"))) {
        score += 0.25;
      }
    }
    return { ...r, _score: score };
  });

  scored.sort((a: any, b: any) => (b._score ?? 0) - (a._score ?? 0));
  return scored.slice(0, TAKE);
}
