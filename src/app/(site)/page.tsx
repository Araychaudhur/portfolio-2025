import { HeroParallax } from "@/components/HeroParallax";
import ValueBlocks from "@/components/home/ValueBlocks";
import ProofCards from "@/components/home/ProofCards";
import FocusTabs from "@/components/home/FocusTabs";
import { ProfileFlow } from "@/components/ProfileFlow";

export default function Page() {
  return (
    <main className="relative">
      <HeroParallax />

      {/* Value props, proof, and focus (from runbook) */}
      <ValueBlocks />
      <ProofCards />
      <FocusTabs />

      {/* Unified Profile + Walkthrough (your epicenter) */}
      <ProfileFlow />

      <footer className="container mt-20 mb-10 text-center text-sm text-muted">
        © {new Date().getFullYear()} Apoorva Ray Chaudhuri — Thanks for visiting.
      </footer>

      <div id="ask" className="h-1" />
    </main>
  );
}
