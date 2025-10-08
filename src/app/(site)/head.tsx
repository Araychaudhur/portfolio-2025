// src/app/(site)/head.tsx
// Global <head> for (site) routes: preconnects + theme colors + JSON-LD.

function json(obj: unknown) {
  return { __html: JSON.stringify(obj) };
}

export default function Head() {
  const base =
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") as string) ||
    "http://localhost:3000";

  // Supabase origin for faster first connection in the browser
  const supabaseOrigin = (() => {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      return u ? new URL(u).origin : undefined;
    } catch {
      return undefined;
    }
  })();

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${base}#owner`,
    name: "Apoorva Ray Chaudhuri",
    jobTitle: "Platform and AI Engineer",
    url: base,
    email: "mailto:araychaudhur@binghamton.edu",
    sameAs: [
      "https://github.com/Araychaudhur",
      "https://www.linkedin.com/in/apoorva-ray-chaudhuri",
    ],
    knowsAbout: [
      "AWS",
      "Kubernetes",
      "FastAPI",
      "PostgreSQL",
      "Redis",
      "RAG",
      "pgvector",
      "vLLM",
      "Hugging Face",
      "LangGraph",
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Apoorva Ray Chaudhuri — Portfolio",
    url: base,
    publisher: { "@id": `${base}#owner` },
  };

  return (
    <>
      {/* Perf: connect early to Supabase (client-only use) */}
      {supabaseOrigin ? (
        <>
          <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
          <link rel="dns-prefetch" href={supabaseOrigin} />
        </>
      ) : null}

      {/* Mobile browser theme colors */}
      <meta name="theme-color" content="#0b0b0b" media="(prefers-color-scheme: dark)" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={json(person)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={json(website)} />
    </>
  );
}
