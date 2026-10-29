import { Acasa, type TermenDeschis } from "@/components/Acasa";
import { CATALOG } from "@/lib/catalog";
import { GHID, ordoneaza } from "@/lib/ghid";
import { aziISO } from "@/lib/potrivire";

// Pagina principală: landing page-ul (textul, în română și engleză, e în components/Acasa.tsx).
// Aplicația („Pentru tine”) e la /aplicatie.
// Termenele deschise se calculează la fiecare cerere, ca numărătoarea să fie mereu cea de azi.
export const dynamic = "force-dynamic";

export default function Pagina() {
  const azi = aziISO();
  // Termenele care se închid acum, din pagina „Toate legile”: doar cele încă deschise, cele mai apropiate primele.
  const deschise: TermenDeschis[] = ordoneaza(GHID, CATALOG, azi)
    .active.filter((a) => a.zile !== null && a.zile >= 0 && a.termen)
    .sort((a, b) => a.zile! - b.zile!)
    .map((a) => ({ id: a.id, zile: a.zile!, termen: a.termen!, pentru: a.pentru, ce: a.ce, salvezi: a.salvezi }));

  return <Acasa azi={azi} deschise={deschise} />;
}
