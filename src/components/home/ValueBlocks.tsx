"use client";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Block = { title: string; body: string; href: string; tag: string };

const BLOCKS: Block[] = [
  {
    title: "Reliability",
    body:
      "Fewer surprises in prod. Clean rollouts, fast rollbacks, boring releases. Clear runbooks and SLOs instead of lore.",
    href: "/case-studies/observability-program#results",
    tag: "Platform focus",
  },
  {
    title: "Speed",
    body:
      "Ship without drama. Roadmaps driven by p95 and error budgets, not vibes. Less toil, more delivery.",
    href: "/case-studies/observability-program#context",
    tag: "Operational calm",
  },
  {
    title: "Grounded answers",
    body:
      "Cited answers users can trust. Rerank and caching to tame the tail. Quality vs cost tuned with data.",
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
            onClick={() => track("home_value_click", { title: b.title })}
            className="group rounded-3xl border p-6 shadow-soft transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <span className="inline-block rounded-full border px-3 py-1 text-xs text-muted">
              {b.tag}
            </span>
            <h3 className="mt-3 text-xl font-semibold">{b.title}</h3>
            <p className="mt-2 text-sm text-muted">{b.body}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-[hsl(var(--brand))]">
              See the work <span aria-hidden>›</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
