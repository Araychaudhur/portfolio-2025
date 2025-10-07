// src/components/intro/SlideToStart.tsx
"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect } from "react";

type Props = {
  onComplete: () => void;
  label?: string;
};

export default function SlideToStart({ onComplete, label = "Slide to start" }: Props) {
  const x = useMotionValue(0);
  const width = 320;
  const handle = 48;
  const max = width - handle;

  useEffect(() => {
    const unsub = x.on("change", (v) => {
      if (v >= max) onComplete();
    });
    return () => unsub();
  }, [x, max, onComplete]);

  return (
    <div className="mx-auto mt-10 w-[320px] select-none">
      <div className="relative h-12 w-full rounded-full border bg-background/70 p-1">
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(0,0,0,.04))]" aria-hidden />
        </div>

        <motion.div
          className="absolute left-0 top-0 z-10 h-12 w-12 cursor-pointer touch-none rounded-full border bg-card shadow-soft"
          drag="x"
          dragConstraints={{ left: 0, right: max }}
          style={{ x }}
          dragSnapToOrigin={false}
          dragElastic={0}
        />

        <div className="pointer-events-none flex h-full items-center justify-center text-sm text-muted">
          {label}
        </div>
      </div>
    </div>
  );
}
