// src/app/(site)/case-studies/page.tsx
import { Suspense } from "react";
import { getAllCaseMeta } from "@/lib/cases";
import CaseGrid from "@/components/CaseGrid";

export const metadata = {
  title: "Case Studies",
  description: "Selected work with clear outcomes and proofs",
};

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
