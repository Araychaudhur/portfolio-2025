"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReplaySkeleton from "@/components/ReplaySkeleton";
import { track } from "@/lib/analytics";

type Metric = { name: string; before: number; after: number; unit: string };
type Step = { id: string; label: string; body: string; media?: { type: "image"; src: string; alt?: string }[]; metrics?: Metric[] };
type ReplayData = { slug: string; title: string; summary: string; steps: Step[] };

export function ReplayPlayer({ src }: { src: string }) {
  const [data, setData] = React.useState<ReplayData | null>(null);
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    fetch(src).then(r => r.json()).then(j => alive && setData(j)).catch(() => alive && setData(null));
    return () => { alive = false; };
  }, [src]);

  // deeplink on load
  React.useEffect(() => {
    if (!data) return;
    const hash = window.location.hash.replace("#", "");
    const idx = data.steps.findIndex(s => s.id === hash);
    if (idx >= 0) setI(idx);
  }, [data]);

  // keep hash + analytics
  React.useEffect(() => {
    if (!data) return;
    const step = data.steps[i];
    if (step?.id) {
      history.replaceState(null, "", `#${step.id}`);
      track("replay_step", { slug: data.slug, id: step.id, idx: i });
      if (i === data.steps.length - 1) track("replay_complete", { slug: data.slug });
    }
  }, [i, data]);

  // keyboard
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!data) return;
      if (e.key === "ArrowRight") setI(v => Math.min(v + 1, data.steps.length - 1));
      if (e.key === "ArrowLeft") setI(v => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  if (!data) return <ReplaySkeleton />;
  const step = data.steps[i];

  return (
    <div className="card" aria-live="polite">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">{data.title}</h2>
        <p className="mt-1 text-muted">{data.summary}</p>
      </header>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Replay steps">
        {data.steps.map((s, idx) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={idx === i}
            aria-controls={`panel-${s.id}`}
            id={`tab-${s.id}`}
            onClick={() => setI(idx)}
            className={`rounded-full border px-3 py-1 text-xs ${idx === i ? "glass" : ""}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step.id}
          id={`panel-${step.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${step.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <h3 className="text-lg font-semibold">{step.label}</h3>
            <p className="mt-2">{step.body}</p>

            {step.metrics?.length ? (
              <div className="mt-4 space-y-2">
                {step.metrics.map((m, idx) => (
                  <div key={idx} className="flex justify-between rounded-xl border p-3">
                    <span>{m.name}</span>
                    <span className="font-mono">
                      {m.before}{m.unit} → <span className="gradient-text">{m.after}{m.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            {step.media?.length
              ? step.media.map((mm, idx) => (
                  <img key={idx} src={mm.src} alt={mm.alt || ""} className="w-full rounded-2xl border" />
                ))
              : <div className="rounded-2xl border p-6 text-sm text-muted">No media for this step.</div>}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="mt-5 flex items-center justify-between">
        <button className="btn-outline rounded-full" onClick={() => setI(v => Math.max(v - 1, 0))} disabled={i === 0} aria-label="Previous step">← Prev</button>
        <div className="text-xs text-muted">Use ← → keys</div>
        <button className="btn rounded-full" onClick={() => setI(v => Math.min(v + 1, data.steps.length - 1))} disabled={i === data.steps.length - 1} aria-label="Next step">Next →</button>
      </div>
    </div>
  );
}
