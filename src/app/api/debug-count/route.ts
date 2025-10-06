import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const total = await supabase.from("documents").select("*", { count: "exact", head: true });
  const rag = await supabase.from("documents").select("*", { count: "exact", head: true }).like("url", "/case-studies/rag-at-scale%");
  const obs = await supabase.from("documents").select("*", { count: "exact", head: true }).like("url", "/case-studies/observability-program%");
  return NextResponse.json({
    ok: true,
    total: total.count ?? 0,
    ragAtScale: rag.count ?? 0,
    observability: obs.count ?? 0,
    errors: [total.error?.message, rag.error?.message, obs.error?.message].filter(Boolean),
  });
}
