"use client";
import Link from "next/link";
import * as React from "react";

const PANELS = {
  AI: {
    bullets: [
      "Grounded answers with anchors",
      "Rerank + caching to tame tail",
      "Trade quality vs cost with data",
    ],
    cta: { href: "/case-studies/rag-at-scale#replay", label: "Open the RAG walkthrough" },
  },
  Platform: {
    bullets: [
      "OTel traces/metrics across services",
      "Dashboards + SLOs replace lore",
      "Rollbacks and runbooks are boring",
    ],
    cta: { href: "/case-studies/observability-program#replay", label: "Open the observability walkthrough" },
  },
} as const;

type Tab = keyof typeof PANELS;

export default function FocusTabs() {
  const [tab, setTab] = React.useState<Tab>("AI");

  const panel = PANELS[tab];
  return (
    <section className="container pt-10">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("AI")}
          className={`rounded-full border px-3 py-1 text-xs ${tab === "AI" ? "glass" : ""}`}
        >
          AI focus
        </button>
        <button
          onClick={() => setTab("Platform")}
          className={`rounded-full border px-3 py-1 text-xs ${tab === "Platform" ? "glass" : ""}`}
        >
          Platform focus
        </button>
      </div>

      <div className="mt-4 rounded-3xl border p-6 shadow-soft">
        <ul className="grid gap-3 md:grid-cols-3">
          {panel.bullets.map((b, i) => (
            <li key={i} className="rounded-xl border p-3 text-sm">
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Link className="btn" href={panel.cta.href}>
            {panel.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
