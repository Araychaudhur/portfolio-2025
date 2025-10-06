"use client";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Block = { title: string; body: string; href: string; tag: string };

const BLOCKS: Block[] = [
  {
    title: "Reliability",
    body:
      "Fewer surprises in prod: clean rollouts, fast rollbacks, boring releases. Clear runbooks and SLOs instead of lore.",
    href: "/case-studies/observability-program#results",
    tag: "Platform focus",
  },
  {
    title: "Speed",
    body:
      "APIs that last: simple shapes, pagination, honest errors. Latency budgets and guardrails built in.",
    href: "/case-studies/observability-program#what-i-changed",
    tag: "Platform focus",
  },
  {
    title: "Grounded answers",
    body:
      "DocQA that cites sources and stays inside the rails. Feels native with fast tail latency and sane cost.",
    href: "/case-studies/rag-at-scale#results",
    tag: "AI focus",
  },
];

export default function ValueBlocks() {
  return (
    <section className="container pt-10">
      <h2 className="text-2xl font-semibold">What I optimize for</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {BLOCKS.map((b) => (
          <Link
            key={b.title}
            href={b.href}
            onClick={() => track("cta_click", { from: "value-block", name: b.title })}
            className="group relative overflow-hidden rounded-3xl border bg-card/70 p-6 shadow-soft transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[hsl(var(--brand)/.12)] blur-2xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--brand2)/.12)] blur-2xl" />
            <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs glass">
              <span className={`h-2 w-2 rounded-full ${b.tag.startsWith("AI") ? "bg-[hsl(var(--brand))]" : "bg-[hsl(var(--brand2))]"}`} />
              {b.tag}
            </span>
            <h3 className="mt-3 text-xl font-semibold">{b.title}</h3>
            <p className="mt-2 text-sm text-muted">{b.body}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-[hsl(var(--brand))]">
              See the work <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
