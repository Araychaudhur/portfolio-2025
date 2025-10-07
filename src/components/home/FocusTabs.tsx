"use client";
import Link from "next/link";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Panel = {
  bullets: string[];
  results: string[]; // metric badges
  cta: { href: string; label: string };
};

const PANELS: Record<string, Panel> = {
  AI: {
    bullets: [
      "Grounded answers with anchors",
      "Rerank and caching to tame the tail",
      "Trade quality vs cost with data",
    ],
    results: ["EM +0.08", "p99 ≤ 1.0 s", "Spend −35%"],
    cta: { href: "/case-studies/rag-at-scale#replay", label: "Open the RAG walkthrough" },
  },
  Platform: {
    bullets: [
      "OTel traces and metrics across services",
      "SLOs with dashboards and runbooks",
      "Health-gated deploys and quick rollbacks",
    ],
    results: ["HTTP p95 −150 ms", "Noise −50%", "Faster MTTR"],
    cta: { href: "/case-studies/observability-program#results", label: "See the observability wins" },
  },
};

export default function FocusTabs() {
  const tabs = Object.keys(PANELS) as (keyof typeof PANELS)[];
  const [active, setActive] = React.useState<keyof typeof PANELS>("AI");
  const panel = PANELS[active];

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div role="tablist" aria-label="Focus areas" className="relative flex gap-2 rounded-full border p-1">
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={active === t}
              className={`relative z-10 rounded-full px-4 py-2 text-sm ${active === t ? "text-foreground" : "text-muted-foreground"}`}
              onClick={() => setActive(t)}
            >
              {t}
              {active === t ? (
                <motion.span
                  layoutId="tabs-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-muted"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="mt-6 rounded-3xl border p-6 shadow-soft"
          >
            <h3 className="text-lg font-medium">{active} focus</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {panel.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Results row */}
            <div className="mt-4 flex flex-wrap gap-2">
              {panel.results.map((r) => (
                <span key={r} className="rounded-full border px-2.5 py-1 text-xs">
                  {r}
                </span>
              ))}
            </div>

            <div className="mt-5">
              <Link className="btn" href={panel.cta.href}>
                {panel.cta.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
