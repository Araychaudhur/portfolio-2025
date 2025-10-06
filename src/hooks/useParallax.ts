"use client";
import * as React from "react";
import { useReducedMotion } from "framer-motion";

/** Scroll-based parallax, guarded for SSR + reduced motion. */
export function useParallax() {
  const prefersReduced = useReducedMotion();
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    if (prefersReduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setOffset(window.scrollY || 0));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [prefersReduced]);

  const styleFor = React.useCallback(
    (speed: number) => (prefersReduced ? {} : { transform: `translate3d(0, ${Math.round(offset * speed)}px, 0)` }),
    [offset, prefersReduced]
  );

  return { offset, styleFor };
}
