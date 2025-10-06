"use client";
import Link from "next/link";

type Card = { headline: string; caption: string; href: string };

const CARDS: Card[] = [
  { headline: "≤ 1.0 s p99", caption: "Answer latency (cached) — DocQA", href: "/case-studies/rag-at-scale#results" },
  { headline: "−35% LLM spend", caption: "Cost down while quality stayed high", href: "/case-studies/rag-at-scale#quality" },
  { headline: "p95 420 → 270 ms", caption: "HTTP p95 after observability push", href: "/case-studies/observability-program#results" },
];

export default function ProofCards() {
  return (
    <section className="container pt-10">
      <h2 className="text-2xl font-semibold">Proof, not promises</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.headline}
            href={c.href}
            className="rounded-3xl border p-6 shadow-soft transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <div className="text-2xl font-semibold">{c.headline}</div>
            <div className="mt-1 text-sm text-muted">{c.caption}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
