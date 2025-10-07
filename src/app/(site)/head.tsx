function json(obj: unknown) {
  return { __html: JSON.stringify(obj) };
}

export default function Head() {
  const base =
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") as string) ||
    "http://localhost:3000";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={json(person)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={json(website)}
      />
    </>
  );
}
