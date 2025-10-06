// src/app/(site)/about/page.tsx
export const metadata = {
  title: "About",
  description: "Who I am and how I work",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>

      <section className="mt-6 space-y-4 text-base leading-7">
        <p>
          I am a platform and AI engineer. I like simple releases, clear
          dashboards, and features that help real users. I care about safety
          and about moving fast without breaking trust.
        </p>

        <p>
          On the platform side I work with FastAPI, PostgreSQL, Redis, and
          Kubernetes. On the AI side I build reliable RAG systems, tune
          latency and cost with caching and vLLM, and use evaluation gates so
          only better changes ship.
        </p>

        <p>
          I aim for calm operations and steady progress. Boring deploys.
          Short incidents. Clear ownership. Good defaults.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-medium">Toolbelt</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[
            "AWS",
            "Kubernetes",
            "FastAPI",
            "PostgreSQL",
            "Redis",
            "vLLM",
            "Hugging Face",
            "LangGraph",
            "OpenTelemetry",
            "Prometheus",
            "Grafana",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border px-3 py-1"
              aria-label={`tool ${t}`}
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
