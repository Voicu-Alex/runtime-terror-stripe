import { SurseLimitari, type StatisticiCatalog } from "@/components/SurseLimitari";
import destinatii from "@/data/destinatii.json";
import { CATALOG } from "@/lib/catalog";

export const metadata = { title: "Surse și limitări · Buzunar" };

/** Cifrele paginii se calculează din catalog, ca să nu rămână în urmă când se adaugă acte. */
function statistici(): StatisticiCatalog {
  const verificari = CATALOG.map((s) => s.verificat_la).filter(Boolean).sort();
  const incredere = { ridicata: 0, medie: 0, scazuta: 0 };
  for (const s of CATALOG) if (s.incredere in incredere) incredere[s.incredere as keyof typeof incredere] += 1;
  return {
    acte: CATALOG.length,
    inVigoare: CATALOG.filter((s) => s.status === "in_vigoare").length,
    adoptate: CATALOG.filter((s) => s.status === "adoptat").length,
    estimari: CATALOG.filter((s) => s.estimare).length,
    incredere,
    verificatLa: verificari[verificari.length - 1] ?? null,
    // doar destinațiile cu link verificat; celelalte sunt ghișee (primăria, HR-ul), fără adresă web
    destinatii: Object.values(destinatii as Record<string, { url: string | null }>).filter((d) => d.url).length,
  };
}

export default function Surse() {
  return <SurseLimitari statistici={statistici()} />;
}
