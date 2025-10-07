// src/components/intro/IntroGate.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntroGate() {
  const router = useRouter();

  useEffect(() => {
    // Always show the intro when enabled, on every visit to "/"
    const enabled = process.env.NEXT_PUBLIC_ENABLE_INTRO === "1";
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const path = window.location.pathname || "/";
    const isHome = path === "/" || path === "/(site)";
    const isIntro = path.startsWith("/intro");

    if (isHome && !isIntro) {
      try {
        router.replace("/intro");
      } catch {
        window.location.assign("/intro");
      }
    }
  }, [router]);

  return null;
}
