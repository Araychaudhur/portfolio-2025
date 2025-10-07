// src/app/(site)/intro/page.tsx
import TypeSequence from "@/components/intro/TypeSequence";
import IntroActions from "@/components/intro/IntroActions"; // <-- add this import

export const metadata = {
  title: "Welcome",
  description: "A quick hello before we begin",
  robots: { index: false, follow: false },
};

function Lines() {
  return (
    <TypeSequence
      lines={[
        "Hey",
        "I’m Apoorva Ray Chaudhuri",
        "I build AI that answers and platforms that don’t panic",
        "Let’s get started",
      ]}
    />
  );
}

export default function IntroPage() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Soft background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,.35),transparent)] blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,.28),transparent)] blur-3xl" />
      </div>

      <div className="container flex min-h-[100svh] flex-col items-center justify-center gap-8 py-20 text-center">
        <Lines />
        {/* Interactive actions moved into a client component */}
        <IntroActions />
      </div>
    </main>
  );
}
