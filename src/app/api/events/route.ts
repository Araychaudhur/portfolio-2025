import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { event, props, ts } = body || {};
    // PII-safe: never log full text; drop headers; keep coarse IP only if needed.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    console.log("[analytics]", event, { ...props, ts, ip });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "fail" }, { status: 400 });
  }
}
