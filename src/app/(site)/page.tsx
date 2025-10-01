import { HeroSection } from "@/components/blocks/hero-section";
import { ValuePropsSection } from "@/components/blocks/value-props-section";

const valueProps = [
  {
    title: "35% Reduction in GenAI Costs",
    description:
      "Optimized LLM spend with strategic caching and quantization, maintaining quality while cutting costs.",
  },
  {
    title: "40% Fewer Deployment Failures",
    description:
      "Engineered a zero-downtime blue/green deployment strategy on AWS for high-reliability releases.",
  },
  {
    title: "Sub-Second AI Latency",
    description:
      "Served 35,000 daily AI queries at sub-second p99 latency through vLLM, ONNX optimization, and a robust EKS architecture.",
  },
  {
    title: "47% Faster Time-to-Answer",
    description:
      "Cut time to first answer in agentic workflows using measured, policy-driven routing.",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection
        title="Production-Grade AI, Delivered on Resilient Platforms."
        subtitle="A Senior AI Engineer specializing in building and scaling reliable, cost-effective Generative AI systems—from performant RAG pipelines to policy-driven agentic workflows."
      />
      <ValuePropsSection title="Results, Not Just R&D" props={valueProps} />
    </>
  );
}