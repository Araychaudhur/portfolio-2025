// src/components/blocks/rag-bot-ui.tsx
"use client";

import { useId, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Citation = { ref?: number; url?: string; heading?: string };
type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;                 // answer only (no appended Sources block)
  citations?: Citation[];       // structured citations for clickable links
};

type Focus = { slug: string; label?: string };

// -------- helpers -----------------------------------------------------------

function parseSlugFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const needle = "/case-studies/";
    const i = path.indexOf(needle);
    if (i === -1) return null;
    const rest = path.slice(i + needle.length);
    const slug = rest.split(/[\/#?]/)[0];
    return slug || null;
  } catch {
    return null;
  }
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// Pick the most common slug from citations (first pass if tie)
function pickFocusFromCitations(cites?: Citation[] | null): Focus | null {
  if (!Array.isArray(cites) || cites.length === 0) return null;
  const freq = new Map<string, number>();
  for (const c of cites) {
    const slug = parseSlugFromUrl(c?.url);
    if (slug) freq.set(slug, (freq.get(slug) || 0) + 1);
  }
  let top: string | null = null;
  let max = 0;
  for (const [slug, n] of freq) {
    if (n > max) {
      max = n;
      top = slug;
    }
  }
  if (!top) return null;
  return { slug: top, label: humanizeSlug(top) };
}

/** Decide whether to inject context. Conservative exceptions:
 *  - If user explicitly references a *different* case slug in their text.
 *  - If user includes a clear keyword that already pins a different case (we only check our current focus).
 */
function shouldInjectContext(q: string, focus: Focus): boolean {
  const s = q.toLowerCase();
  // If user explicitly mentions a case-studies path different from our focus, don't inject.
  const pathIdx = s.indexOf("/case-studies/");
  if (pathIdx !== -1) {
    const after = s.slice(pathIdx + "/case-studies/".length);
    const mentioned = after.split(/[\/#\s?]/)[0];
    if (mentioned && mentioned !== focus.slug.toLowerCase()) return false;
  }
  // If user mentions the focused slug explicitly, no need to inject.
  if (s.includes(focus.slug.toLowerCase())) return false;

  // Otherwise, inject. (We removed the overly-broad "contains 'case'" block.)
  return true;
}

// -------- component ---------------------------------------------------------

export function RagBotUI() {
  const baseId = useId();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // current conversational focus (sticky case)
  const [focus, setFocus] = useState<Focus | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;

    setErr(null);

    // Show exactly what the user typed
    const userMsg: Msg = { id: `${baseId}-u-${crypto.randomUUID()}`, role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // If we have a focus and the question is generic, add a concrete prefix with the slug path.
    const effectiveQuestion =
      focus && shouldInjectContext(q, focus)
        ? `In the context of the case study at /case-studies/${focus.slug}, ${q}`
        : q;

    try {
      const endpoint = focus ? "/api/ask-scoped" : "/api/ask";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: effectiveQuestion,
          focusSlug: focus?.slug ?? null,
        }),
        cache: "no-store",
      });
      if (!res.ok) {
        let j: any = null;
        try {
          j = await res.json();
        } catch {}
        throw new Error(j?.error || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as {
        answer?: string;
        citations?: Citation[];
      };

      const botMsg: Msg = {
        id: `${baseId}-a-${crypto.randomUUID()}`,
        role: "assistant",
        text: (data?.answer || "").trim(),
        citations: Array.isArray(data?.citations) ? data!.citations : undefined,
      };

      // Update sticky focus from citations (most frequent slug wins)
      const nextFocus = pickFocusFromCitations(botMsg.citations);
      if (nextFocus) setFocus(nextFocus);

      setMessages((m) => [...m, botMsg]);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Legacy fallback: split inline "Sources" text if ever present
  function splitLegacySources(s: string): { answer: string; sourcesText?: string } {
    const idx = s.lastIndexOf("\nSources\n");
    if (idx >= 0) return { answer: s.slice(0, idx).trim(), sourcesText: s.slice(idx + 9).trim() };
    return { answer: s, sourcesText: undefined };
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky context pill (when active) */}
      {focus ? (
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <span>
            Following up on:{" "}
            <span className="font-medium text-foreground">
              {focus.label || focus.slug}
            </span>{" "}
            <span className="text-muted">( /case-studies/{focus.slug} )</span>
          </span>
          <button
            type="button"
            className="rounded-full border px-2 py-0.5"
            onClick={() => setFocus(null)}
            aria-label="Clear follow-up context"
            title="Clear follow-up context"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-grow space-y-4 overflow-y-auto p-2">
        {messages.map((m) => {
          const isUser = m.role === "user";
          const legacy = splitLegacySources(m.text);
          const showAnswer = legacy.answer;
          const hasStructured = !isUser && Array.isArray(m.citations) && m.citations.length > 0;
          const legacySources = !hasStructured ? legacy.sourcesText : undefined;

          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-7 shadow-sm ${
                  isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
                style={{ fontSize: "16px" }}
              >
                {/* Main answer */}
                <div className="whitespace-pre-wrap">{showAnswer}</div>

                {/* Sources (structured clickable) */}
                {hasStructured ? (
                  <div className="mt-3 border-t pt-2 text-sm leading-6">
                    <div className="mb-1 font-medium">Sources</div>
                    <ul className="space-y-1">
                      {m.citations!.map((c, i) => {
                        const n = c?.ref ?? i + 1;
                        const label = (c?.heading || "Source").trim();
                        const url = c?.url?.trim();
                        return (
                          <li key={`${m.id}-c-${n}`}>
                            {url ? (
                              <a
                                href={url}
                                className="underline underline-offset-2"
                                target={url.startsWith("http") ? "_blank" : "_self"}
                                rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
                              >
                                [#{n}] {label}
                              </a>
                            ) : (
                              <span>[#{n}] {label}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {/* Sources (legacy plain text fallback) */}
                {!hasStructured && legacySources ? (
                  <div className="mt-3 border-t pt-2 text-sm leading-6">
                    <div className="mb-1 font-medium">Sources</div>
                    <div className="[&>a]:underline [&>a]:underline-offset-2 whitespace-pre-wrap">
                      {legacySources}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {err ? (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <form onSubmit={onSubmit} className="border-t p-3">
        <div className="flex items-center gap-x-2">
          <Input
            value={input}
            placeholder="Ask about my work..."
            onChange={(e) => setInput(e.target.value)}
            className="h-11 flex-grow text-base"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()} className="h-11 px-5">
            {loading ? "Sending..." : "Ask"}
          </Button>
        </div>
      </form>

      <p className="px-3 pb-2 pt-1 text-xs text-muted">
        Answers are grounded in this site’s content. If it’s not here, I’ll say I can’t answer from the portfolio yet.
      </p>
    </div>
  );
}
