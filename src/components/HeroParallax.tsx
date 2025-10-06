"use client";
import Link from "next/link";
import * as React from "react";
import { useParallax } from "@/hooks/useParallax";

function ProofChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border px-5 py-4 text-left bg-card/70">
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}

export function HeroParallax() {
  const { styleFor } = useParallax();

  return (
    <section className="relative overflow-hidden">
      {/* Parallax blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-[44rem] w-[44rem] rounded-full blur-3xl opacity-30"
        style={{ ...styleFor(0.18), background: "radial-gradient(closest-side, hsl(var(--brand)/.55), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-25"
        style={{ ...styleFor(0.12), background: "radial-gradient(closest-side, hsl(var(--brand2)/.55), transparent 70%)" }}
        aria-hidden
      />

      <div className="container pt-28 pb-10 md:pt-36 md:pb-12 relative">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Hi, I’m{" "}
            <span className="gradient-text inline-block whitespace-nowrap">
              Apoorva Ray Chaudhuri
            </span>
            . I build reliable AI features and backend systems.
          </h1>

          <p className="mt-5 text-lg text-muted">
            Proof, not promises. Browse the case studies or book a quick intro.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link className="btn" href="/contact" data-cta="book-intro">
              Book a quick intro
            </Link>
            <Link className="btn-outline" href="/case-studies" data-cta="browse-cases">
              Browse the case studies
            </Link>
            <a className="btn-outline" href="#ask">Ask a question</a>
          </div>

          {/* Proof chips */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            <ProofChip value="35k+/day" label="Real queries" />
            <ProofChip value="p95 < 1s" label="Feels native" />
            <ProofChip value="−35%" label="LLM spend" />
            <ProofChip value="0 PII incidents" label="Safety in prod" />
          </div>
        </div>
      </div>
    </section>
  );
}
export default HeroParallax;
