/* eslint-disable no-console */
/**
 * Tone sanitizer for case-study MDX files.
 * - Rewrites glyphs (→, ↓, ↑, ~) to plain English
 * - Rephrases compact metrics like "p95 latency: 420ms -> 270ms" to a sentence
 * - Expands first "p95" in a section to "p95 (95th percentile)"
 * - Skips code blocks ``` ... ``` to avoid altering code
 *
 * Usage:
 *   npx tsx scripts/tone_sanitize.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, "src", "content", "case-studies");

type Piece = { kind: "text" | "code"; value: string };

function splitByFences(src: string): Piece[] {
  const pieces: Piece[] = [];
  const fence = /```[\s\S]*?```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = fence.exec(src))) {
    if (m.index > last) pieces.push({ kind: "text", value: src.slice(last, m.index) });
    pieces.push({ kind: "code", value: m[0] });
    last = fence.lastIndex;
  }
  if (last < src.length) pieces.push({ kind: "text", value: src.slice(last) });
  return pieces;
}

function sanitizeTextBlock(input: string): string {
  let s = input;

  // Normalize curly/odd dashes/arrows first
  s = s.replace(/→|->/g, " to ");
  s = s.replace(/↑/g, " increased ");
  s = s.replace(/↓/g, " decreased ");
  s = s.replace(/±/g, " plus or minus ");

  // Replace leading "~" or "≈" before a number with "approximately "
  s = s.replace(/(?:^|\s)[~≈]\s*(\d+(\.\d+)?)/g, (m, num) => ` approximately ${num}`);

  // Normalize ms spacing (e.g., "270ms" -> "270 ms")
  s = s.replace(/(\d+)\s*ms\b/gi, "$1 ms");

  // Normalize % spacing (e.g., "50%" -> "50%")
  // (kept as-is, but we use in sentence rewrites below)

  // Turn compact metric lines into sentences
  // e.g., "p95 latency: 420 ms -> 270 ms" -> "p95 latency decreased from 420 ms to 270 ms."
  s = s.replace(
    /(^|\n)\s*([A-Za-z0-9 \-_/()]+?):\s*(\d+(?:\.\d+)?)\s*ms\s*(?:to|→|->)\s*(\d+(?:\.\d+)?)\s*ms\s*$/gim,
    (_m, lead, label, a, b) => {
      const decreased = Number(b) < Number(a);
      const verb = decreased ? "decreased" : "increased";
      return `${lead}${label.trim()} ${verb} from ${a} ms to ${b} ms.`;
    }
  );

  // Percent version: "Alert noise: 100% -> 50%" -> "Alert noise decreased from 100% to 50%."
  s = s.replace(
    /(^|\n)\s*([A-Za-z0-9 \-_/()]+?):\s*(\d+(?:\.\d+)?)%\s*(?:to|→|->)\s*(\d+(?:\.\d+)?)%\s*$/gim,
    (_m, lead, label, a, b) => {
      const decreased = Number(b) < Number(a);
      const verb = decreased ? "decreased" : "increased";
      return `${lead}${label.trim()} ${verb} from ${a}% to ${b}%.`;
    }
  );

  // Convert naked arrows in in-line deltas, e.g., "420 ms -> 270 ms" not tied to a label
  s = s.replace(/(\d+(?:\.\d+)?)\s*ms\s*(?:to|→|->)\s*(\d+(?:\.\d+)?)\s*ms/gim, (_m, a, b) => {
    const dec = Number(b) < Number(a);
    const verb = dec ? "decreased" : "increased";
    return `${verb} from ${a} ms to ${b} ms`;
  });
  s = s.replace(/(\d+(?:\.\d+)?)%\s*(?:to|→|->)\s*(\d+(?:\.\d+)?)%/gim, (_m, a, b) => {
    const dec = Number(b) < Number(a);
    const verb = dec ? "decreased" : "increased";
    return `${verb} from ${a}% to ${b}%`;
  });

  // Expand first p95 in each paragraph to p95 (95th percentile)
  s = s.replace(/(^|\n)([^\n]+)/g, (_m, lead, para) => {
    let done = false;
    const out = para.replace(/\bp95\b/gi, (m) => {
      if (done) return m;
      done = true;
      return "p95 (95th percentile)";
    });
    return `${lead}${out}`;
  });

  // Trim extra spaces produced by replacements
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/ +\./g, ".");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s;
}

async function processFile(file: string) {
  const original = await fs.readFile(file, "utf8");
  const parts = splitByFences(original);
  const transformed = parts
    .map((p) => (p.kind === "code" ? p.value : sanitizeTextBlock(p.value)))
    .join("");

  if (transformed !== original) {
    await fs.writeFile(file, transformed, "utf8");
    console.log(`✓ Rewrote: ${path.relative(ROOT, file)}`);
  } else {
    console.log(`• No changes: ${path.relative(ROOT, file)}`);
  }
}

(async () => {
  const files = await fg("*.mdx", { cwd: CASES_DIR, absolute: true });
  if (files.length === 0) {
    console.log("No MDX files found under src/content/case-studies");
    process.exit(0);
  }
  console.log(`Found ${files.length} case-study file(s).`);
  for (const f of files) {
    await processFile(f);
  }
  console.log("Done.");
})();
