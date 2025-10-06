"use client";
import Link from "next/link";
import { track } from "@/lib/analytics";

export default function StickyAside({
  title = "TL;DR",
  bullets,
  ctaHref = "/contact",
  ctaLabel = "Book a quick intro",
}: {
  title?: string;
  bullets: string[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <aside className="sticky top-24 self-start rounded-2xl border p-5 shadow-soft">
      <div className="text-sm font-medium">{title}</div>
      <ul className="mt-3 space-y-2 text-sm">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand))]" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="btn mt-4 w-full text-center"
        data-cta="book-intro"
        onClick={() => track("cta_click", { from: "aside" })}
      >
        {ctaLabel}
      </Link>
    </aside>
  );
}
