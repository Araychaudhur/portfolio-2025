// src/app/api/ask-scoped/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseSlugFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const i = path.indexOf("/case-studies/");
    if (i === -1) return null;
    const rest = path.slice(i + "/case-studies/".length);
    const slug = rest.split(/[\/#?]/)[0];
    return slug || null;
  } catch {
    return null;
  }
}

function citesIncludeSlug(cites: any[] | undefined, slug: string): boolean {
  if (!Array.isArray(cites)) return false;
  const low = slug.toLowerCase();
  return cites.some((c) => (parseSlugFromUrl(c?.url) || "").toLowerCase() === low);
}

async function ask(reqUrl: string, question: string) {
  const url = new URL("/api/ask", reqUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const q = (body?.question || "").trim();
  const focusSlug: string | null =
    typeof body?.focusSlug === "string" && body.focusSlug.trim()
      ? body.focusSlug.trim()
      : null;

  if (!q) return NextResponse.json({ error: "Missing question" }, { status: 400 });

  // 1) Try as-is
  const first = await ask(req.url, q);
  if (!first.ok) {
    return NextResponse.json(
      { error: first.data?.error || `Upstream /api/ask failed (${first.status})` },
      { status: 500 }
    );
  }

  // 2) If focused and citations drift, retry once with a strict hint
  if (focusSlug && !citesIncludeSlug(first.data?.citations, focusSlug)) {
    const strict =
      `Answer strictly using content from /case-studies/${focusSlug}. ` +
      `If information is not present there, say you cannot answer from the portfolio. ` +
      `Question: ${q}`;

    const second = await ask(req.url, strict);
    if (second.ok) {
      return NextResponse.json(second.data);
    }
  }

  return NextResponse.json(first.data);
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
