export default function HowIWorkPage() {
  return (
    <main>
      <section>
        <h1>How I Work: Principles in Practice</h1>
        <p>
          Technology is a means to an end. The goal is always to deliver measurable
          business outcomes. Below are the core principles that guide my work,
          backed by real-world proof.
        </p>
      </section>

      {/* Principles Section */}
      <section>
        {/* Principle 1 */}
        <div>
          <h2>1. Grounded & Trustworthy AI</h2>
          <p>
            Answers must cite sources. Evals must gate releases. There are no
            [cite_start]hallucinations in production. [cite: 41, 42]
          </p>
          {/* Link to Case Study 1 will go here */}
        </div>
        {/* Principle 2 */}
        <div>
          <h2>2. Sub-Second Performance at Scale</h2>
          <p>
            Fast is better than flashy. vLLM, intelligent caching, and
            [cite_start]quantization beat naive serving every time. [cite: 43, 44]
          </p>
          {/* Link to Case Study 4 will go here */}
        </div>
        {/* Principle 3 */}
        <div>
          <h2>3. Economic Efficiency</h2>
          <p>
            We drive down cost-per-query while holding—or improving—quality.
            [cite_start]Every token and every GPU cycle has a purpose. [cite: 45]
          </p>
          {/* Link to Case Study 6 will go here */}
        </div>
        {/* Principle 4 */}
        <div>
          <h2>4. Observability-First Reliability</h2>
          <p>
            We instrument before we ship. SLOs, canaries, and safe rollbacks
            [cite_start]are non-negotiable for building systems you can trust. [cite: 47, 48]
          </p>
          {/* Link to Case Study 8 will go here */}
        </div>
        {/* Principle 5 */}
        <div>
          <h2>5. Measured, Policy-Driven Agents</h2>
          <p>
            Agentic workflows are deployed only if they demonstrably cut time
            [cite_start]or boost accuracy, with transparent rationale and guardrails. [cite: 49, 50]
          </p>
          {/* Link to Case Study 11 will go here */}
        </div>
      </section>
    </main>
  );
}