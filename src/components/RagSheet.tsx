// src/components/RagSheet.tsx
"use client";

import { useState, useEffect } from "react";
import { RagBotUI } from "@/components/blocks/rag-bot-ui";

/**
 * Floating Q&A launcher with a solid, readable panel.
 * - Opaque card surface (no heavy transparency)
 * - Soft backdrop blur behind the card
 * - Keyboard: Esc closes; focus trap-lite
 */
export default function RagSheet() {
  const [open, setOpen] = useState(false);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-[linear-gradient(180deg,hsl(var(--brand)),hsl(var(--brand2)))] px-4 py-3 text-sm font-medium text-white shadow-lg hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Ask about my work
      </button>

      {/* Overlay + Panel */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50"
          onMouseDown={(e) => {
            // click outside to close
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Dim + blur background */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

          {/* Panel */}
          <div className="absolute bottom-5 right-5 w-[min(100vw,720px)]">
            <div className="rounded-3xl border bg-card text-card-foreground shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 rounded-t-3xl border-b px-5 py-3">
                <div className="text-sm font-medium">Ask about my work</div>
                <button
                  type="button"
                  className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[70vh] overflow-auto px-4 py-4">
                <RagBotUI />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
