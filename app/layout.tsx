import type { Metadata, Viewport } from "next";
import { Antet, Subsol, SariLaContinut } from "@/components/Antet";
import { LimbaProvider } from "@/components/Limba";
import { SCRIPT_TEMA } from "@/components/Tema";
import "./globals.css";

// Fonturile designului de referință (v3 F): Inter pentru text și sume, Raleway pentru titluri mari.
// Le încărcăm cu <link>, nu cu next/font: next/font le descarcă la build și build-ul pică
// când descărcarea de la Google eșuează (s-a întâmplat de 2 ori din 4 local).
const FONTURI =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Raleway:wght@700;800&family=Geist:wght@500;600;700&display=swap";

// Adresa publică, pentru linkurile absolute din previzualizare (Open Graph). Vercel o dă singur la build.
const ADRESA = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(ADRESA),
  title: "Ce înseamnă pentru mine",
  description: "Fiecare lege nouă, tradusă în lei pe an pentru tine.",
  appleWebApp: { capable: true, title: "Ce înseamnă", statusBarStyle: "default" },
  openGraph: {
    title: "Ce înseamnă pentru mine",
    description: "Every new Romanian law, in lei per year for you, with what you can do and by when.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#18181B" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: SCRIPT_TEMA pune data-theme pe <html> înainte să ajungă React
    <html lang="ro" suppressHydrationWarning>
      <head>
        {/* Tema înainte de prima afișare, ca pagina să nu clipească în tema greșită */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTURI} />
      </head>
      <body className="min-h-screen antialiased">
        <LimbaProvider>
          <SariLaContinut />
          <Antet />
          <main id="continut" tabIndex={-1} className="mx-auto max-w-[1080px] px-4 py-6">{children}</main>
          <Subsol />
        </LimbaProvider>
      </body>
    </html>
  );
}
