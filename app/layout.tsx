import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Raleway } from "next/font/google";
import "./globals.css";

// Fonturile designului de referință (v3 F): Inter pentru text și sume, Raleway pentru titluri mari.
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin", "latin-ext"], weight: ["700", "800"] });

export const metadata: Metadata = {
  title: "Ce înseamnă pentru mine",
  description: "Fiecare lege nouă, tradusă în lei pe lună pentru tine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${inter.variable} ${raleway.variable}`}>
      <body className="min-h-screen antialiased">
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-2xl items-center gap-5 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold">
              Ce înseamnă pentru mine
            </Link>
            <Link href="/flux" className="text-stone-600 hover:text-stone-900">
              Flux
            </Link>
            <Link href="/documente" className="text-stone-600 hover:text-stone-900">
              Documente
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-2xl px-4 pb-8 text-xs text-stone-500">
          {/* AI Act, art. 50: conținutul generat cu AI e marcat pe fiecare ecran, nu doar unde apare. */}
          Analiză generată cu AI, verifică etichetele. Informare, nu consultanță financiară sau juridică. Profilul rămâne pe
          dispozitivul tău.
        </footer>
      </body>
    </html>
  );
}
