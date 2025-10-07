"use client";
import Link from "next/link";
import { motion } from "framer-motion";

type Card = {
  headline: string;
  caption: string;
  href: string;
  replay?: { label: string }; // e.g., { label: "Replay · 90s" }
};

const CARDS: Card[] = [
  {
    headline: "Sub-second responses for 99% of requests",
    caption: "DocQA answers feel native",
    href: "/case-studies/rag-at-scale#results",
    replay: { label: "Replay · 90s" },
  },
  {
    headline: "Cut AI costs by 35%",
    caption: "Cost down while quality stayed high",
    href: "/case-studies/rag-at-scale#quality",
  },
  {
    headline: "Tail latency dropped from 420 ms to 270 ms",
    caption: "HTTP p95 after observability push",
    href: "/case-studies/observability-program#results",
  },
];

export default function ProofCards() {
  return (
    <section className="container pt-10">
      <h2 className="text-2xl font-semibold">Proof, not promises</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {CARDS.map((c) => (
          <motion.div
            key={c.headline}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -4, rotateX: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 16 }}
          >
            <Link
              href={c.href}
              className="group relative block rounded-3xl border p-6 shadow-soft transition-transform focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {c.replay ? (
                <span className="absolute right-3 top-3 rounded-full border bg-background/80 px-2 py-0.5 text-xs">
                  {c.replay.label}
                </span>
              ) : null}
              <div className="text-2xl font-semibold">{c.headline}</div>
              <div className="mt-1 text-sm text-muted">{c.caption}</div>
              <div className="mt-4 text-sm text-[hsl(var(--brand))]">
                See the work <span aria-hidden>›</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
