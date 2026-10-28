import type { Metadata } from "next";
import { Antet, Subsol } from "@/components/Antet";
import { LimbaProvider } from "@/components/Limba";
import "./globals.css";

// Fonturile designului de referință (v3 F): Inter pentru text și sume, Raleway pentru titluri mari.
// Le încărcăm cu <link>, nu cu next/font: next/font le descarcă la build și build-ul pică
// când descărcarea de la Google eșuează (s-a întâmplat de 2 ori din 4 local).
const FONTURI =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Raleway:wght@700;800&display=swap";

export const metadata: Metadata = {
  title: "Ce înseamnă pentru mine",
  description: "Fiecare lege nouă, tradusă în lei pe lună pentru tine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTURI} />
      </head>
      <body className="min-h-screen antialiased">
        <LimbaProvider>
          <Antet />
          <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
          <Subsol />
        </LimbaProvider>
      </body>
    </html>
  );
}
