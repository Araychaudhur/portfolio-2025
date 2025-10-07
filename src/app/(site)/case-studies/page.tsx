// src/app/(site)/case-studies/page.tsx
import { Suspense } from "react";
import { getAllCaseMeta } from "@/lib/cases";
import CaseGrid from "@/components/CaseGrid";
import type { Metadata } from "next";

export async function generateMetadata(
  { searchParams }: { searchParams?: Record<string, string | string[] | undefined> }
): Promise<Metadata> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    process.env.SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  const canonical = `${base}/case-studies`;

  const isSet = (v: unknown) => {
    if (Array.isArray(v)) return v.length > 0 && String(v[0]).toLowerCase() !== "all";
    if (typeof v === "string") return v.length > 0 && v.toLowerCase() !== "all";
    return false;
  };

  const hasFilters = ["o", "stack", "cloud", "domain", "sort"].some((k) =>
    isSet(searchParams?.[k])
  );

  return {
    title: "Case Studies",
    description: "Selected work with clear outcomes and proofs",
    alternates: { canonical },
    robots: { index: !hasFilters, follow: true },
  };
}

export default async function CaseStudiesPage() {
  const items = await getAllCaseMeta();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Case Studies</h1>
      <p className="mt-3 text-base text-muted">
        Explore by outcome, stack, cloud, or domain.
      </p>

      {/* Wrap any component that uses useSearchParams in Suspense */}
      <div className="mt-8">
        <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
          <CaseGrid items={items} />
        </Suspense>
      </div>
    </main>
  );
}
