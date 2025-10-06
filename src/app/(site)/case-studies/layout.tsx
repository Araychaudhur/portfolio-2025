// src/app/(site)/case-studies/layout.tsx
export const metadata = {
  title: "Case Studies",
  description: "Short, verifiable stories with outcomes first.",
};

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: no <html> or <body> here — only the root layout uses those.
  return <>{children}</>;
}
