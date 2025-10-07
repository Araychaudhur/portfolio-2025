// src/components/intro/IntroActions.tsx
"use client";

import SlideToStart from "@/components/intro/SlideToStart";

function goHome() {
  if (typeof window !== "undefined") {
    window.location.assign("/home"); // <- go to the non-root home route
  }
}

export default function IntroActions() {
  return (
    <>
      <SlideToStart label="Slide to start" onComplete={goHome} />
      <button
        type="button"
        className="mt-6 rounded-full border px-4 py-2 text-sm text-muted hover:text-foreground"
        onClick={goHome}
      >
        Skip
      </button>
    </>
  );
}
