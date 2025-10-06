import Link from "next/link";

const bullets = [
  "Fewer surprises in prod: clean rollouts, fast rollbacks, boring releases.",
  "Observability that actually helps: useful dashboards, fewer noisy alerts, faster fixes.",
  "APIs that last more than one quarter: simple shapes, pagination, clear errors.",
  "Infra that doesn’t get in the way: scripts over spreadsheets; docs over lore.",
  "A calm way of working so the team plants flags and moves forward together."
];

export default function SDEResumePage() {
  return (
    <main className="container py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="inline-block rounded-full border px-3 py-1 text-sm glass">Backend / Platform</p>
        <h1 className="mt-4 text-4xl font-semibold">Resume — SDE</h1>
        <p className="mt-3 text-muted">
          Short version: I like making changes safe and the system understandable.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a className="btn" href="/files/Apoorva-Ray-Chaudhuri-Resume-SDE.pdf" target="_blank" rel="noreferrer">Download PDF</a>
          <a className="btn-outline" href="https://www.linkedin.com/in/apoorva-ray-chaudhuri" target="_blank" rel="noreferrer">LinkedIn</a>
          <Link className="btn-outline" href="/">Back home</Link>
        </div>
      </header>

      <section className="mx-auto mt-10 grid max-w-4xl gap-4">
        {bullets.map((b, i) => (
          <div key={i} className="card flex gap-3">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-[hsl(var(--brand2))] shadow-glow flex-shrink-0" />
            <p>{b}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-10 max-w-4xl">
        <div className="card">
          <h2 className="text-xl font-semibold">Résumé (inline)</h2>
          <object
            data="/files/Apoorva-Ray-Chaudhuri-Resume-SDE.pdf"
            type="application/pdf"
            className="mt-4 h-[80vh] w-full rounded-2xl border"
          >
            <p>PDF preview unavailable. <a className="underline" href="/files/Apoorva-Ray-Chaudhuri-Resume-SDE.pdf">Download the PDF</a>.</p>
          </object>
        </div>
      </section>
    </main>
  );
}
