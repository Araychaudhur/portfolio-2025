import { ImageResponse } from "next/og";
import { getCaseBySlug } from "@/lib/cases";
import type { Metadata } from "next";
// ⬇️ change runtime so Node built-ins are available
export const runtime = "nodejs";       // was: "edge"
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    process.env.SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000");

export const metadata: Metadata = {
  // lets Next resolve relative OG/Twitter image URLs without warnings
  metadataBase: new URL(BASE_URL),
};

export default async function Image({ params }: { params: { slug: string } }) {
  let title = "Case Study";
  let subtitle = "";
  let stack: string[] = [];
  let cloud: string[] = [];

  try {
    const { frontmatter: fm } = await getCaseBySlug(params.slug);
    title = fm?.title || title;
    subtitle = fm?.subtitle || "";
    stack = Array.isArray(fm?.stack) ? fm.stack : [];
    cloud =
      (Array.isArray(fm?.cloud) && fm.cloud) ||
      (Array.isArray(fm?.stackCloud) && fm.stackCloud) ||
      (Array.isArray(fm?.tags?.cloud) && fm.tags.cloud) ||
      [];
  } catch {
    // keep defaults
  }

  const chips = [...new Set([...cloud, ...stack])].slice(0, 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          background:
            "radial-gradient(900px 600px at -10% -10%, rgba(99,102,241,.22), transparent 60%), radial-gradient(900px 600px at 110% 10%, rgba(34,197,94,.22), transparent 60%), #0b0b0b",
          color: "#fff",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0.9 }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                border: "1px solid rgba(255,255,255,.18)",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 24,
              }}
            >
              {c}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          {subtitle ? (
            <div style={{ fontSize: 30, color: "rgba(255,255,255,.8)" }}>{subtitle}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.85 }}>
          <div style={{ fontSize: 24 }}>Apoorva Ray Chaudhuri • Portfolio</div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,.18)",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 22,
            }}
          >
            case-studies/{params.slug}
          </div>
        </div>
      </div>
    ),
    size
  );
}
