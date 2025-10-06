"use client";

export function StatTiles({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s, i) => (
        <div key={i} className="rounded-2xl border p-4">
          <div className="text-2xl font-semibold">{s.value}</div>
          <div className="text-sm">{s.label}</div>
          {s.hint ? <div className="mt-1 text-xs text-muted">{s.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
