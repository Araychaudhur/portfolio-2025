// src/app/(site)/home/page.tsx
import type { Metadata } from "next";
import HomePage from "../page";

export async function generateMetadata(): Promise<Metadata> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    process.env.SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";
  return {
    title: "Home",
    description: "Portfolio of Apoorva Ray Chaudhuri",
    alternates: { canonical: `${base}/home` },
    robots: { index: true, follow: true },
  };
}

export default HomePage;
