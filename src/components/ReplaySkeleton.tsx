"use client";

export default function ReplaySkeleton() {
  return (
    <div className="card" id="replay">
      <div className="h-6 w-64 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
      <div className="mt-2 h-4 w-80 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
      <div className="mt-4 h-24 rounded bg-black/5 dark:bg-white/5" />
    </div>
  );
}
