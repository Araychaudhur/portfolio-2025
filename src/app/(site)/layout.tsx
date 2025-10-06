// src/app/(site)/layout.tsx
import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import CtaTracker from "@/components/CtaTracker";
import dynamic from "next/dynamic";

// Load the floating Q&A launcher as a pure client island to avoid SSR mismatches.
const RagSheet = dynamic(
  () => import("@/components/RagSheet").then((m) => m.RagSheet ?? m.default),
  { ssr: false, loading: () => null }
);

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata = {
  title: {
    default: "Apoorva Ray Chaudhuri",
    template: "%s — Apoorva Ray Chaudhuri",
  },
  description:
    "Proof, not promises. Case studies with interactive walkthroughs and a Q&A bot that cites this site.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        {/* Soft vignette / tints */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 800px at -20% -20%, hsl(var(--brand)/.18), transparent 55%), radial-gradient(900px 600px at 120% 10%, hsl(var(--brand2)/.18), transparent 55%)",
          }}
        />
        {/* Optional grid (safe if not defined) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-grid" />

        {children}

        {/* Global CTA analytics */}
        <CtaTracker />

        {/* Floating Q&A launcher */}
        <div className="fixed right-5 bottom-5 z-50">
          <RagSheet />
        </div>

        {/* Anchor used by “Ask a question” links */}
        <div id="ask" className="sr-only" />
      </body>
    </html>
  );
}
