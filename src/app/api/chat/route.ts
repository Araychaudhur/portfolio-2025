// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function extractQuestion(body: any): string {
  const q1 = body?.question ?? body?.q ?? body?.prompt;
  if (typeof q1 === "string" && q1.trim()) return q1.trim();

  const arr = Array.isArray(body?.messages) ? body.messages : [];
  for (let i = arr.length - 1; i >= 0; i--) {
    const m = arr[i];
    if (m?.role !== "user") continue;

    // v5 style: parts[]
    if (Array.isArray(m.parts)) {
      const piece = m.parts.find((p: any) => typeof p?.text === "string" && p.text.trim());
      if (piece?.text) return piece.text.trim();
    }

    // legacy: content can be string or array
    if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
    if (Array.isArray(m.content)) {
      const piece = m.content.find((c: any) => typeof c?.text === "string" && c.text.trim());
      if (piece?.text) return piece.text.trim();
    }
  }

  return "";
}

function renderText(
  answer: string,
  citations?: Array<{ ref?: number; url?: string; heading?: string }>
) {
  let text = (answer || "").trim();
  if (Array.isArray(citations) && citations.length > 0) {
    const lines = citations.map((c, i) => {
      const n = c?.ref ?? i + 1;
      const label = c?.heading?.trim() || "Source";
      const url = c?.url?.trim();
      return url ? `[#${n}] ${label} — ${url}` : `[#${n}] ${label}`;
    });
    text += `\n\nSources\n` + lines.join("\n");
  }
  return text;
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const question = extractQuestion(body);
  if (!question) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  // Proxy to existing RAG endpoint to reuse logic
  const askUrl = new URL("/api/ask", req.url);
  const askRes = await fetch(askUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question }),
    cache: "no-store",
  });

  if (!askRes.ok) {
    let err: any = null;
    try {
      err = await askRes.json();
    } catch {}
    return NextResponse.json(
      { error: err?.error || `Upstream /api/ask failed (${askRes.status})` },
      { status: 500 }
    );
  }

  const data = (await askRes.json()) as {
    answer?: string;
    citations?: Array<{ ref?: number; url?: string; heading?: string }>;
  };

  const text = renderText(data?.answer || "", data?.citations || []);

  // Build a universal assistant message:
  // - v5 prefers `messages: [{ role, content: [{type:'text', text}] }]`
  // - we also include `message` and `text` for broader compatibility
  const id = crypto.randomUUID();
  const assistant = {
    id,
    role: "assistant",
    content: [{ type: "text", text }], // v5-friendly array form
    // Provide "parts" too for any consumers that still read it
    parts: [{ type: "text", text }],
  };

  return NextResponse.json({
    message: assistant,            // some clients expect { message }
    messages: [assistant],         // v5 append path
    text,                          // last-resort compatibility
  });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
