import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  const env = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const result: any = { env, openai: null, supabase: null, rpc: null };

  // Test OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const e = await openai.embeddings.create({ model: "text-embedding-3-small", input: "ping" });
    result.openai = { ok: true, dim: e.data[0].embedding.length };
  } catch (e: any) {
    result.openai = { ok: false, error: e.message };
  }

  // Test Supabase + RPC
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const zeros = Array(1536).fill(0);
    const { data: rpcData, error: rpcError } = await supabase.rpc("match_documents", {
      query_embedding: zeros,
      match_count: 1,
      match_threshold: 0,
    });
    result.rpc = { ok: !rpcError, n: (rpcData || []).length, error: rpcError?.message };
  } catch (e: any) {
    result.supabase = { ok: false, error: e.message };
  }

  return Response.json(result);
}
