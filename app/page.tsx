import { Acasa, type TermenDeschis } from "@/components/Acasa";
import { CATALOG } from "@/lib/catalog";
import { GHID, ordoneaza } from "@/lib/ghid";
import { aziISO } from "@/lib/potrivire";

// Pagina principală: landing page-ul (textul, în română și engleză, e în components/Acasa.tsx).
// Aplicația („Pentru tine”) e la /aplicatie.
// Termenul cel mai apropiat se calculează la fiecare cerere, ca numărătoarea să fie mereu cea de azi.
export const dynamic = "force-dynamic";

export default function Pagina() {
  // Cel mai apropiat termen încă deschis din pagina „Toate legile”: eticheta din cârlig și îndemnul final.
  const [a] = ordoneaza(GHID, CATALOG, aziISO())
    .active.filter((a) => a.zile !== null && a.zile >= 0 && a.termen)
    .sort((a, b) => a.zile! - b.zile!);
  const primul: TermenDeschis | null = a ? { zile: a.zile!, termen: a.termen! } : null;

  return <Acasa primul={primul} />;
}
