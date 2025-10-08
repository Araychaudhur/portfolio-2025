"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Minimal client-side log; replace with your logger if needed
    console.error("Route error:", error?.message || error, error?.digest);
  }, [error]);

  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="rounded-3xl border p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-muted">
          The page hit an unexpected error. You can try again or head home.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/home">Go to homepage</Link>
          </Button>
        </div>

        {process.env.NODE_ENV !== "production" && error?.digest ? (
          <p className="mt-4 text-xs text-muted">Error ID: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
