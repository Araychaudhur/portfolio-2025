// src/components/case/StackEnvironmentChips.tsx
type Props = {
  stack?: string[];
  cloud?: string[]; // from frontmatter: cloud | stackCloud | tags.cloud
  className?: string;
};

function uniq(a: string[] = []) {
  return Array.from(new Set(a.map((s) => s.trim()).filter(Boolean)));
}

/** Renders Cloud chips first, then Stack chips. */
export default function StackEnvironmentChips({ stack = [], cloud = [], className = "" }: Props) {
  const clouds = uniq(cloud);
  const stacks = uniq(stack);

  if (!clouds.length && !stacks.length) return null;

  return (
    <section className={["mt-6", className].filter(Boolean).join(" ")}>
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Stack & environment</h2>
      <div className="flex flex-wrap gap-2">
        {clouds.map((c) => (
          <span key={`cloud-${c}`} className="rounded-full border px-3 py-1 text-sm" aria-label={`cloud ${c}`}>
            {c}
          </span>
        ))}
        {stacks.map((s) => (
          <span key={`stack-${s}`} className="rounded-full border px-3 py-1 text-sm" aria-label={`stack ${s}`}>
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
