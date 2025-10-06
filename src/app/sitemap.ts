// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllCaseSlugs } from "@/lib/cases";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  const slugs = await getAllCaseSlugs();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly",  priority: 1,    lastModified: now },
    { url: `${base}/case-studies`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
  ];

  const casePages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/case-studies/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: now,
  }));

  return [...staticPages, ...casePages];
}
