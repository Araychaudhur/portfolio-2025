// src/app/resume/layout.tsx
export const metadata = {
  title: "Resume",
  description: "PDF previews and summaries.",
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: no <html> or <body> here — only the root layout uses those.
  return <>{children}</>;
}
