import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const n = Number(req.nextUrl.searchParams.get("n") || 8);

  if (!q.trim()) {
    return NextResponse.json({ error: "Pass ?q=question" }, { status: 400 });
  }

  // embed question
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: q,
  });
  const query_embedding = emb.data[0].embedding as number[];

  // vector search via the array-accepting RPC
  const { data, error } = await supabase.rpc("match_documents_arr", {
    query_embedding,
    match_count: n,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data || []).map((r: any, i: number) => ({
    rank: i + 1,
    similarity: Number(r.similarity).toFixed(4),
    url: r.url,
    heading: r.heading,
    excerpt: r.content.slice(0, 180).replace(/\s+/g, " ") + (r.content.length > 180 ? "…" : ""),
  }));

  return NextResponse.json({ ok: true, q, n: rows.length, top: rows });
}
