// src/components/intro/TypeSequence.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  lines: string[];
  delay?: number;
};

export default function TypeSequence({ lines, delay = 0 }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl text-center">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          className={`text-balance ${i === 1 ? "text-3xl md:text-5xl font-semibold" : "text-xl md:text-2xl"} leading-tight`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.5, type: "spring", stiffness: 160, damping: 18 }}
        >
          <span className="align-middle">{line}</span>
          {!reduce && (
            <motion.span
              className="ml-1 inline-block h-[1em] w-[0.5ch] translate-y-[3px] bg-foreground/70 align-middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: delay + i * 0.5 + 0.25 }}
              aria-hidden
            />
          )}
        </motion.p>
      ))}
    </div>
  );
}
