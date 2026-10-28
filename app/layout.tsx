import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ce înseamnă pentru mine",
  description: "Fiecare lege nouă, tradusă în lei pe lună pentru tine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="min-h-screen antialiased">
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-2xl items-center gap-5 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold">
              Ce înseamnă pentru mine
            </Link>
            <Link href="/documente" className="text-stone-600 hover:text-stone-900">
              Documente
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
