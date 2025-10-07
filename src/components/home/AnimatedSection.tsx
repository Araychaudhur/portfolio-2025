// src/components/home/AnimatedSection.tsx
"use client";

import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

type Props = PropsWithChildren<{
  delay?: number;
}>;

export default function AnimatedSection({ children, delay = 0 }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay }}
    >
      {children}
    </motion.section>
  );
}
