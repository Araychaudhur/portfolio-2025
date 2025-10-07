// src/components/replay/ReplayAuto.tsx
"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";

// Define the props your ReplayPlayer accepts (aligned with current usage)
type ReplayPlayerProps = {
  src: string;
  durationSec?: number;
  title?: string;
  className?: string;
};

// Robust dynamic import: return the component (default or named)
const ReplayPlayer = dynamic<ReplayPlayerProps>(
  async () => {
    const mod = await import("@/components/ReplayPlayer");
    const Cmp =
      (mod as any).default ??
      (mod as any).ReplayPlayer;

    // Ensure we return a component, not the module
    return Cmp as ComponentType<ReplayPlayerProps>;
  },
  { ssr: false, loading: () => null }
);

type Props = ReplayPlayerProps;

type AnyStep = { id?: string; title?: string; label?: string; text?: string; desc?: string };

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(!!mq.matches);
    update();
    if ("addEventListener" in mq) mq.addEventListener("change", update);
    else if ("addListener" in mq) (mq as any).addListener(update);
    return () => {
      if ("removeEventListener" in mq) mq.removeEventListener("change", update);
      else if ("removeListener" in mq) (mq as any).removeListener(update);
    };
  }, []);
  return prefers;
}

export default function ReplayAuto({ src, durationSec, title, className = "" }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [forcePlay, setForcePlay] = useState(false);

  if (!prefersReducedMotion || forcePlay) {
    return <ReplayPlayer src={src} durationSec={durationSec} title={title} className={className} />;
  }

  return (
    <ReducedMotionStatic
      src={src}
      durationSec={durationSec}
      title={title}
      onPlayAnyway={() => setForcePlay(true)}
      className={className}
    />
  );
}

function ReducedMotionStatic({
  src,
  durationSec,
  title,
  onPlayAnyway,
  className,
}: Props & { onPlayAnyway: () => void }) {
  const [doc, setDoc] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(src, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setDoc(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load replay");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  const steps: AnyStep[] = useMemo(() => {
    const s = (doc?.steps || doc?.timeline || doc?.events || []) as AnyStep[];
    return Array.isArray(s) ? s : [];
  }, [doc]);

  const showTitle = title || doc?.title || "Replay";

  return (
    <section className={["rounded-2xl border p-4", className].filter(Boolean).join(" ")}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">{showTitle}</h2>
          <p className="text-xs text-muted">Reduced motion view</p>
        </div>
        <div className="text-xs">
          {durationSec ? <span>Approx. {durationSec}s</span> : null}
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Could not load replay data. You can still open the full replay.
        </div>
      ) : null}

      <ol className="mt-4 space-y-2">
        {steps.length > 0 ? (
          steps.map((s, i) => {
            const primary = s.title || s.label || s.id || `Step ${i + 1}`;
            const secondary = s.text || s.desc || "";
            return (
              <li key={s.id || i} className="rounded-lg border p-3">
                <div className="font-medium">{primary}</div>
                {secondary ? <div className="mt-1 text-sm text-muted">{secondary}</div> : null}
              </li>
            );
          })
        ) : (
          <li className="rounded-lg border p-3 text-sm text-muted">
            Steps will appear here. You can open the full replay for the interactive version.
          </li>
        )}
      </ol>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="rounded-xl border px-3 py-1.5 text-sm"
          onClick={onPlayAnyway}
        >
          Play anyway
        </button>
        <a
          className="rounded-xl border px-3 py-1.5 text-sm underline"
          href={src}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open replay JSON
        </a>
      </div>
    </section>
  );
}
