"use client";
import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { useParallax } from "@/hooks/useParallax";

type Metric = { name: string; before: number; after: number; unit: string };
type Step = {
  id: string;
  label: string;
  body: string;
  skills?: string[];
  metrics?: Metric[];
  media?: { type: "image"; src: string; alt?: string }[];
};
type TrackData = {
  track: "ai" | "sde";
  title: string;
  subtitle: string;
  summary: string;
  steps: Step[];
};

function SkillBadge({ text }: { text: string }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className="rounded-full border px-3 py-1 text-xs glass transition-shadow hover:shadow-md hover:shadow-[hsl(var(--brand)/.25)]"
    >
      {text}
    </motion.span>
  );
}

export function ProfileFlow() {
  const prefersReduced = useReducedMotion();
  const { styleFor } = useParallax();

  // Hydration-safe loading
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const [ai, setAI] = React.useState<TrackData | null>(null);
  const [sde, setSDE] = React.useState<TrackData | null>(null);
  const [track, setTrack] = React.useState<"ai" | "sde">("ai");
  const [i, setI] = React.useState(0);

  // Load JSONs client-side
  React.useEffect(() => {
    const f = async () => {
      const [a, b] = await Promise.all([
        fetch("/profile/ai.json").then(r => r.json()),
        fetch("/profile/sde.json").then(r => r.json()),
      ]);
      setAI(a); setSDE(b);

      // Deep link: #ai-results or #sde-design
      const h = window.location.hash.replace("#", "");
      if (h.startsWith("ai-") || h.startsWith("sde-")) {
        const [t, sid] = h.split("-", 2) as ["ai" | "sde", string];
        setTrack(t);
        const arr = (t === "ai" ? a.steps : b.steps) as Array<{ id: string }>;
        const idx = arr.findIndex((s) => s.id === sid);
        if (idx >= 0) setI(idx);
      }
    };
    f();
  }, []);

  // Keep hash in sync
  React.useEffect(() => {
    if (!ai || !sde) return;
    const data = track === "ai" ? ai : sde;
    const step = data.steps[i];
    if (step?.id) history.replaceState(null, "", `#${track}-${step.id}`);
  }, [track, i, ai, sde]);

  // Keyboard navigation (← / →)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI(v => Math.min(v + 1, (track === "ai" ? ai : sde)!.steps.length - 1));
      if (e.key === "ArrowLeft") setI(v => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [track, ai, sde]);

  if (!hydrated || !ai || !sde) {
    // Skeleton
    return (
      <section className="container mt-6">
        <div className="card">
          <div className="h-6 w-40 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
          <div className="mt-2 h-4 w-3/5 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-24 rounded-full border" />
            <div className="h-8 w-28 rounded-full border" />
          </div>
          <div className="mt-6 h-28 rounded-xl border" />
        </div>
      </section>
    );
  }

  const data = track === "ai" ? ai! : sde!;
  const step = data.steps[i];
  const total = data.steps.length;

  return (
    <section className="container mt-6">
      <Reveal>
        <div className="card">
          {/* Header */}
          <Reveal delay={0.05}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs glass">
                <span
                  className={`h-2 w-2 rounded-full ${track === "ai" ? "bg-[hsl(var(--brand))]" : "bg-[hsl(var(--brand2))]"}`}
                />
                {data.subtitle}
              </div>
              <h2 className="text-xl font-semibold">{data.title}</h2>
              <div className="text-sm text-muted">{data.summary}</div>
            </div>
          </Reveal>

          {/* Track toggles */}
          <Reveal delay={0.1}>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                className={`rounded-full border px-3 py-1 transition-transform duration-150 hover:-translate-y-0.5 ${track === "ai" ? "glass" : ""}`}
                onClick={() => { setTrack("ai"); setI(0); }}
              >
                AI focus
              </button>
              <button
                className={`rounded-full border px-3 py-1 transition-transform duration-150 hover:-translate-y-0.5 ${track === "sde" ? "glass" : ""}`}
                onClick={() => { setTrack("sde"); setI(0); }}
              >
                Platform focus
              </button>
            </div>
          </Reveal>

          {/* Step pills */}
          <Reveal delay={0.15}>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.steps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setI(idx)}
                  className={`rounded-full border px-3 py-1 text-xs transition-transform duration-150 hover:-translate-y-0.5 ${idx === i ? "glass" : ""}`}
                  aria-current={idx === i}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* ── Scrubbable timeline (clickable dots + fill) ───────────────────── */}
          <Reveal delay={0.2}>
            <div className="mt-4">
              <div className="relative h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${((i + 1) / total) * 100}%`,
                    background: "linear-gradient(90deg, hsl(var(--brand)), hsl(var(--brand2)))"
                  }}
                  aria-hidden
                />
                {data.steps.map((s, idx) => {
                  const pos = total > 1 ? (idx / (total - 1)) * 100 : 0;
                  const active = idx === i;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setI(idx)}
                      aria-label={`Go to ${s.label}`}
                      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full border bg-background transition-transform ${active ? "scale-110 ring-2 ring-[hsl(var(--ring))]" : "hover:scale-110"}`}
                      style={{ left: `${pos}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Step body */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${track}-${step.id}`}
              initial={prefersReduced ? false : { opacity: 0, y: 6 }}
              animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
              exit={prefersReduced ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              {/* Narrative + skills + metrics */}
              <div>
                <h3 className="text-lg font-semibold">{step.label}</h3>
                <p className="mt-2">{step.body}</p>

                {/* Skills */}
                {step.skills?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AnimatePresence initial={false}>
                      {step.skills.map((t) => <SkillBadge key={t} text={t} />)}
                    </AnimatePresence>
                  </div>
                ) : null}

                {/* Metrics */}
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

              {/* Media (subtle parallax) */}
              <div className="space-y-3 will-change-transform" style={styleFor(0.05)}>
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
            <button className="btn-outline rounded-full" onClick={() => setI(v => Math.max(v - 1, 0))} disabled={i === 0}>← Prev</button>
            <div className="text-xs text-muted">Use ← → keys</div>
            <button className="btn rounded-full" onClick={() => setI(v => Math.min(v + 1, total - 1))} disabled={i === total - 1}>Next →</button>
          </div>

          {/* Gentle CTA */}
          <div className="mt-6 text-center text-sm text-muted">
            Want the full résumé? Feel free to ask — happy to send it along.
          </div>
        </div>
      </Reveal>
    </section>
  );
}
