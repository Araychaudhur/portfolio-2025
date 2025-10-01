import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Apoorva Ray Chaudhuri | AI & Platform Engineer",
  description: "Portfolio of Apoorva Ray Chaudhuri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="container mx-auto max-w-4xl px-4 py-6">
          <nav>
            <ul className="flex items-center gap-x-6 text-sm font-medium text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">Home</Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-foreground">Case Studies</Link>
              </li>
              <li>
                <Link href="/how-i-work" className="hover:text-foreground">How I Work</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container mx-auto max-w-4xl px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}