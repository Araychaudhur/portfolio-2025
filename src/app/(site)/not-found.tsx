import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="rounded-3xl border p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">We couldn’t find that page</h1>
        <p className="mt-2 text-muted">
          The link may be broken or the page may have moved.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/home">Go to homepage</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/case-studies">Browse case studies</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
