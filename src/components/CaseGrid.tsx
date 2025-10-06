// src/components/CaseGrid.tsx
"use client";

import Link from "next/link";
import * as React from "react";
import type { CaseMeta } from "@/lib/cases";
import { track } from "@/lib/analytics";
import { useRouter, useSearchParams } from "next/navigation";

// Helpers
function unique<T>(arr: T[]) { return Array.from(new Set(arr)); }
function byTitle(a: CaseMeta, b: CaseMeta) { return a.title.localeCompare(b.title); }

export default function CaseGrid({ items }: { items: CaseMeta[] }) {
  // Build distinct option lists from data (include “All” at the front)
  const outcomesAll = unique(["All", ...items.flatMap((c) => c.outcomes ?? [])]);
  const stacksAll   = unique(["All", ...items.flatMap((c) => c.stack ?? [])]);
  const cloudsAll   = unique(["All", ...items.flatMap((c) => c.cloud ?? [])]);
  const domainsAll  = unique(["All", ...items.map((c) => c.domain ?? "AI")]).sort();

  const router = useRouter();
  const params = useSearchParams();

  // Seed state from URL (shareable)
  const [outcome, setOutcome] = React.useState<string>(params.get("o") || "All");
  const [stack,   setStack]   = React.useState<string>(params.get("stack") || "All");
  const [cloud,   setCloud]   = React.useState<string>(params.get("cloud") || "All");
  const [domain,  setDomain]  = React.useState<string>(params.get("domain") || "All");
  const [sort,    setSort]    = React.useState<"Impact" | "Title">((params.get("sort") as any) || "Impact");

  // Keep URL in sync without scrolling
  const writeUrl = React.useCallback((next: Partial<Record<string, string>>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "All") p.delete(k);
      else p.set(k, v);
    }
    router.replace(`?${p.toString()}`, { scroll: false });
  }, [params, router]);

  // Filter + sort (memoized)
  const filtered = React.useMemo(() => {
    let list = items.slice();
    if (outcome !== "All") list = list.filter((c) => (c.outcomes ?? []).includes(outcome));
    if (stack   !== "All") list = list.filter((c) => (c.stack ?? []).includes(stack));
    if (cloud   !== "All") list = list.filter((c) => (c.cloud ?? []).includes(cloud));
    if (domain  !== "All") list = list.filter((c) => c.domain === (domain as any));
    list.sort((a, b) => sort === "Impact" ? (b.impactScore - a.impactScore) : byTitle(a, b));
    return list;
  }, [items, outcome, stack, cloud, domain, sort]);

  const clear = () => {
    setOutcome("All"); setStack("All"); setCloud("All"); setDomain("All"); setSort("Impact");
    router.replace("?", { scroll: false });
  };

  // Track replay badge views once per slug (intersection observer)
  React.useEffect(() => {
    const seen = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const slug = el.getAttribute("data-slug") || "";
          if (!seen.has(slug)) {
            seen.add(slug);
            track("replay_badge_view", { slug });
          }
        }
      }
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.25 });

    document.querySelectorAll<HTMLElement>("[data-replay='true']").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  return (
    <>
      {/* Filters + sort */}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
        <Select
          label="Outcome"
          value={outcome}
          onChange={(v) => { setOutcome(v); writeUrl({ o: v }); track("filter_change", { outcome: v }); }}
          options={outcomesAll}
        />
        <Select
          label="Stack"
          value={stack}
          onChange={(v) => { setStack(v); writeUrl({ stack: v }); track("filter_change", { stack: v }); }}
          options={stacksAll}
        />
        <Select
          label="Cloud"
          value={cloud}
          onChange={(v) => { setCloud(v); writeUrl({ cloud: v }); track("filter_change", { cloud: v }); }}
          options={cloudsAll.length ? cloudsAll : ["All"]}
        />
        <Select
          label="Domain"
          value={domain}
          onChange={(v) => { setDomain(v); writeUrl({ domain: v }); track("filter_change", { domain: v }); }}
          options={domainsAll}
        />
        <Select
          label="Sort"
          value={sort}
          onChange={(v) => { setSort(v as any); writeUrl({ sort: v }); track("filter_change", { sort: v }); }}
          options={["Impact", "Title"]}
        />
      </div>

      {/* Clear button (only when any filter active) */}
      {(outcome !== "All" || stack !== "All" || cloud !== "All" || domain !== "All" || sort !== "Impact") ? (
        <div className="mt-3">
          <button
            className="rounded-xl border px-3 py-1 text-sm"
            onClick={() => { clear(); track("filters_cleared", {}); }}
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border p-6 text-center text-muted">
          No case studies match that filter yet. Try clearing filters.
        </div>
      ) : null}

      {/* Grid of tiles */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c.slug}
            href={`/case-studies/${c.slug}${c.hasReplay ? "#replay" : ""}`}
            className="group relative overflow-hidden rounded-3xl border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            prefetch
            style={{ aspectRatio: "16/9" }}
            onClick={() => track("tile_open", { slug: c.slug })}
          >
            {/* Title + subtitle */}
            <div className="absolute inset-x-4 bottom-4">
              <div className="text-lg font-medium">{c.title}</div>
              {c.subtitle ? <div className="mt-1 text-sm text-muted">{c.subtitle}</div> : null}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                {c.outcomes?.slice(0, 3).map((o) => (
                  <span key={o} className="rounded-full border px-2 py-0.5">{o}</span>
                ))}
                {c.cloud?.slice(0, 2).map((cl) => (
                  <span key={cl} className="rounded-full border px-2 py-0.5">{cl}</span>
                ))}
              </div>
            </div>

            {/* Replay pill (observed for analytics) */}
            {c.hasReplay ? (
              <div
                className="pointer-events-none absolute right-3 top-3 rounded-full bg-foreground/90 px-2 py-1 text-xs text-background"
                data-replay="true"
                data-slug={c.slug}
              >
                Replay{c.replayDurationSec ? ` · ${c.replayDurationSec}s` : ""}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col">
      <span className="mb-1 text-xs text-muted">{label}</span>
      <select
        className="rounded-xl border bg-background px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
