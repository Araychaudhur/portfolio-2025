import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const RPC = "match_documents_arr";      // array-accepting RPC
const MAX_SNIPPETS = 12;                // fetch a bit more
const TAKE = 4;                         // feed top-N to the LLM

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  return handleAsk(q);
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const q = String(body?.question || body?.q || "");
  return handleAsk(q);
}

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
  if (/\brag\b|docqa|grounded/.test(q)) return "rag-at-scale";
  if (/observability|grafana|prometheus|slo|otel/.test(q)) return "observability-program";
  if (/vllm|cost.*latency|latency.*cost/.test(q)) return "cost-latency-vllm";
  return "";
}

function wantsChanged(question: string) {
  const q = question.toLowerCase();
  return /what\s+changed|what\s+did\s+you\s+change/.test(q);
}

function rerank(question: string, rows: any[]) {
  const preferred = wantedSlug(question);
  const onlyCases = rows.filter((r) => r.url?.startsWith("/case-studies/"));
  let pool = onlyCases.length ? onlyCases : rows;

  // If preferred slug appears anywhere, restrict pool to only that slug
  if (preferred && pool.some((r) => slugFromUrl(r.url) === preferred)) {
    pool = pool.filter((r) => slugFromUrl(r.url) === preferred);
  }

  const wantsChange = wantsChanged(question);

  const scored = pool.map((r: any) => {
    const slug = slugFromUrl(r.url);
    const h = String(r.heading || "").toLowerCase();
    const hash = hashFromUrl(r.url).toLowerCase();
    let score = Number(r.similarity) || 0;

    if (preferred && slug === preferred) score += 0.6; // stronger bias
    if (wantsChange) {
      if (h.includes("what") && h.includes("chang")) score += 0.25;
      if (hash.includes("what") && hash.includes("chang")) score += 0.25;
      if (preferred === "rag-at-scale" && (hash === "design" || hash.includes("what-changed"))) score += 0.25;
    }
    return { ...r, _score: score };
  });

  scored.sort((a: any, b: any) => b._score - a._score);
  return scored.slice(0, TAKE);
}


async function handleAsk(question: string) {
  if (!question?.trim()) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  // 1) Embed
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const query_embedding = emb.data[0].embedding as number[];

  // 2) Vector search (array RPC)
  const { data: matches, error } = await supabase.rpc(RPC, {
    query_embedding,
    match_count: MAX_SNIPPETS,
  });
  if (error) {
    return NextResponse.json({ error: `Search failed: ${error.message}` }, { status: 500 });
  }
  const rows = (matches || []) as Array<{ url: string; heading: string; content: string; similarity?: number }>;
  if (rows.length === 0) {
    return NextResponse.json({ answer: "I can’t answer from the portfolio yet.", citations: [] });
  }

  // 3) Heuristic re-rank
  const chosen = rerank(question, rows);

  // 4) Build prompt
  const contextBlocks = chosen
    .map((r, i) => `[#${i + 1}] ${r.heading || "(no heading)"}\nURL: ${r.url}\n---\n${r.content}`)
    .join("\n\n");

  const system = [
    "You answer strictly from the provided context (a portfolio site).",
    "Cite as [#n] where n is the block number.",
    "If the context doesn’t contain the answer, say: “I can’t answer from the portfolio yet.”",
  ].join(" ");

  const chat = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Question: ${question}\n\nContext:\n${contextBlocks}` },
    ],
  });

  const answer = chat.choices[0]?.message?.content?.trim() || "I can’t answer from the portfolio yet.";
  const citations = chosen.map((r, i) => ({ ref: i + 1, url: r.url, heading: r.heading }));

  return NextResponse.json({ answer, citations });
}
