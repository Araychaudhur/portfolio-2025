// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This value is inlined at build time (works in dev and prod)
const ENABLED = process.env.NEXT_PUBLIC_ENABLE_INTRO === "1";

export function middleware(req: NextRequest) {
  if (!ENABLED) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Only redirect the root. Do not touch the intro page or any other route.
  if (pathname === "/" /* root only */) {
    const url = req.nextUrl.clone();
    url.pathname = "/intro";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply only to the root URL
export const config = {
  matcher: ["/"],
};
