import { getAllCaseMeta } from "@/lib/cases";
import CaseGrid from "@/components/CaseGrid";

export const metadata = { title: "Case Studies" };

export default async function CaseStudiesIndex() {
  const items = await getAllCaseMeta(); // server-side
  return (
    <main className="container py-12 md:py-16">
      <h1 className="text-3xl font-semibold">Case Studies</h1>
      <p className="mt-2 text-muted">
        Short, verifiable stories with outcomes first. Each has a quick walkthrough.
      </p>

      <div className="mt-6">
        {/* Client grid for filters/sort, fed by server data */}
        <CaseGrid items={items} />
      </div>
    </main>
  );
}
