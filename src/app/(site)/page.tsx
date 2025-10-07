// src/app/(site)/page.tsx
import AnimatedSection from "@/components/home/AnimatedSection";
import { HeroParallax } from "@/components/HeroParallax";
import ValueBlocks from "@/components/home/ValueBlocks";
import ProofCards from "@/components/home/ProofCards";
import FocusTabs from "@/components/home/FocusTabs";
import { ProfileFlow } from "@/components/ProfileFlow";

export default function Page() {
  return (
    <main className="relative">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,.25),transparent)] blur-2xl" />
        <div className="absolute top-1/3 -right-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,.18),transparent)] blur-2xl" />
        <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(14,165,233,.18),transparent)] blur-2xl" />
      </div>

      {/* Hero */}
      <HeroParallax />

      {/* Value props, proof, and focus */}
      <AnimatedSection delay={0.05}>
        <ValueBlocks />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <ProofCards />
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <FocusTabs />
      </AnimatedSection>

      {/* Unified Profile + Walkthrough (your epicenter) */}
      <AnimatedSection delay={0.2}>
        <ProfileFlow />
      </AnimatedSection>

      <footer className="container mt-20 mb-10 text-center text-sm text-muted">
        {new Date().getFullYear()} Apoorva Ray Chaudhuri — Thanks for visiting.
      </footer>

      <div id="ask" className="h-1" />
    </main>
  );
}
