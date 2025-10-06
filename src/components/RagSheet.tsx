"use client";
import * as React from "react";
import { track } from "@/lib/analytics";

type Citation = { ref: number; url: string; heading: string };

export default function RagSheet() {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [cites, setCites] = React.useState<Citation[]>([]);

  const ask = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setCites([]);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setAnswer(data.answer);
      setCites(Array.isArray(data.citations) ? data.citations : []);
      track("rag_query", { ok: true });
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      track("rag_query", { ok: false, err: e?.message || "unknown" });
    } finally {
      setLoading(false);
    }
  };

  // Open/close with keyboard
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Floating launcher */}
      <button
        className="btn rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        data-cta="rag-open"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Ask about the work (⌘/Ctrl+K)"
      >
        Ask about my work
      </button>

      {/* Sheet */}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] grid place-items-end p-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative w-full max-w-2xl rounded-3xl border bg-background p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Ask about my work</h2>
              <button className="btn-outline rounded-full" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                className="w-full rounded-xl border bg-card/60 px-3 py-2"
                placeholder='Try: "What changed in the RAG case study?"'
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? ask() : null)}
                aria-label="Ask a question about the portfolio"
              />
              <button className="btn" onClick={ask} disabled={loading}>
                {loading ? "Thinking…" : "Ask"}
              </button>
            </div>

            {/* States */}
            {error ? <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</p> : null}

            {answer && (
              <div className="mt-4">
                <div className="rounded-2xl border p-4">
                  <div className="prose prose-invert max-w-none text-sm">
                    {/* The answer already has bracket refs like [#1] */}
                    <p>{answer}</p>
                  </div>

                  {/* Clickable citations */}
                  {cites.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="text-xs font-medium">Sources</div>
                      <ul className="mt-2 space-y-1 text-xs">
                        {cites.map((c) => (
                          <li key={c.ref}>
                            <a
                              className="underline decoration-dotted underline-offset-2 hover:no-underline"
                              href={c.url}
                              onClick={() => track("rag_citation_click", { url: c.url })}
                            >
                              [#{c.ref}] {c.heading || c.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footnote */}
            <p className="mt-3 text-xs text-muted">
              Answers are grounded in this site’s content. If it’s not here, I’ll say I can’t answer from the portfolio yet.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
