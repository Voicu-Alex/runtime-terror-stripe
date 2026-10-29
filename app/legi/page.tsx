import { ToateLegile } from "@/components/ToateLegile";
import { CATALOG } from "@/lib/catalog";
import { GHID, ordoneaza } from "@/lib/ghid";

// „Toate legile”: noutățile și ghidul de dinainte, într-o singură secțiune (components/ToateLegile.tsx).
// Ghidul (lib/ghid.ts) e ordonat după cât poți salva; data demo-ului e 28 oct 2026.
const AZI_DEMO = "2026-10-28";

export const metadata = { title: "Toate legile · Buzunar" };

export default async function PaginaLegi({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { active, expirate } = ordoneaza(GHID, CATALOG, AZI_DEMO);
  return <ToateLegile qInitial={q ?? ""} ghid={[...active, ...expirate]} />;
}
