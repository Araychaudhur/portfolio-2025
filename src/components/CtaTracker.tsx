"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function CtaTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest("[data-cta]") as HTMLElement | null;
      if (el) track("cta_click", { name: el.getAttribute("data-cta") || "unknown" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
