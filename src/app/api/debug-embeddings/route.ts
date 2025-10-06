import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const total = await supabase.from("documents").select("*", { count: "exact", head: true });
  const withEmb = await supabase.from("documents").select("*", { count: "exact", head: true }).not("embedding", "is", null);
  const withoutEmb = await supabase.from("documents").select("*", { count: "exact", head: true }).is("embedding", null);

  const ragWith = await supabase.from("documents").select("*", { count: "exact", head: true })
    .like("url", "/case-studies/rag-at-scale%").not("embedding", "is", null);

  const sample = await supabase.from("documents")
    .select("url, heading, content")
    .not("embedding", "is", null)
    .limit(3);

  return NextResponse.json({
    ok: true,
    counts: {
      total: total.count ?? 0,
      withEmbedding: withEmb.count ?? 0,
      withoutEmbedding: withoutEmb.count ?? 0,
      ragWithEmbedding: ragWith.count ?? 0,
    },
    sample: sample.data ?? [],
    errors: [total.error?.message, withEmb.error?.message, withoutEmb.error?.message, ragWith.error?.message, sample.error?.message].filter(Boolean),
  });
}
