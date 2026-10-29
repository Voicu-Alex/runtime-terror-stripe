import { Acasa, type CardTelefon, type Telefon, type TermenDeschis } from "@/components/Acasa";
import { dupaImpact, vedere } from "@/lib/card";
import { CATALOG } from "@/lib/catalog";
import { GHID, ordoneaza } from "@/lib/ghid";
import { PERSOANE_DEMO } from "@/lib/persoane-demo";
import { traduce } from "@/lib/i18n";
import { aziISO, potriveste } from "@/lib/potrivire";
import { normalizeaza } from "@/lib/profil";

// Pagina principală: landing page-ul cu 7 ecrane (textul, în română și engleză, e în components/Acasa.tsx).
// Aplicația („Pentru tine”) e la /aplicatie.
// Termenul cel mai apropiat și telefonul din primul ecran se calculează la fiecare cerere, ca cifrele să fie cele de azi.
export const dynamic = "force-dynamic";

/** Telefonul din primul ecran: potrivirile reale ale lui Andrei (persoană fictivă), nu cifre scrise de mână. */
function telefonAndrei(azi: string): Telefon {
  const { nume, profil } = PERSOANE_DEMO.andrei;
  const p = normalizeaza(profil);
  const potriviri = potriveste(p, CATALOG, azi).filter((x) => x.moment !== "expirat");
  const sigure = potriviri.filter((x) => x.stare === "sigur" && x.impact_lei_luna !== null).sort(dupaImpact);
  const carduri: CardTelefon[] = [];
  // cea mai mare sumă în minus (impactul legii)
  const minus = sigure.find((x) => x.impact_lei_luna! < 0);
  if (minus) {
    const ro = vedere(minus, p.valori, "ro");
    const en = vedere(minus, p.valori, "en");
    carduri.push({ kicker: { ro: ro.kicker, en: en.kicker }, titlu: { ro: ro.titlu, en: en.titlu }, suma: ro.suma!, unitate: { ro: "lei/an", en: "lei/yr" }, act: { ro: ro.act, en: en.act } });
  }
  // cea mai mare sumă pe care o mai poate păstra printr-o acțiune permisă de lege (economia, cu termenul încă deschis)
  const cuEconomie = potriviri
    .filter((x) => x.stare === "sigur" && x !== minus)
    .map((x) => ({ x, ro: vedere(x, p.valori, "ro"), en: vedere(x, p.valori, "en") }))
    .filter((y) => y.ro.economie && !y.ro.economie.punctuala && !y.ro.termen?.depasit)
    .sort((a, b) => b.ro.economie!.suma - a.ro.economie!.suma)[0];
  if (cuEconomie) {
    const { ro, en } = cuEconomie;
    const e = ro.economie!;
    carduri.push({
      kicker: { ro: ro.termen ? `Ce poți face · până pe ${ro.termen.text}` : "Ce poți face", en: en.termen ? `What you can do · by ${en.termen.text}` : "What you can do" },
      titlu: { ro: ro.titlu, en: en.titlu },
      suma: e.suma,
      unitate: { ro: `${e.unitate} · ce poți păstra`, en: `${traduce("en", e.unitate)} · what you can keep` },
      act: { ro: ro.act, en: en.act },
    });
  }
  return { nume, numar: potriviri.length, carduri };
}

export default function Pagina() {
  const azi = aziISO();
  // Cel mai apropiat termen încă deschis din pagina „Toate legile”: eticheta din telefon și îndemnul final.
  const [a] = ordoneaza(GHID, CATALOG, azi)
    .active.filter((a) => a.zile !== null && a.zile >= 0 && a.termen)
    .sort((a, b) => a.zile! - b.zile!);
  const primul: TermenDeschis | null = a ? { zile: a.zile!, termen: a.termen! } : null;

  return <Acasa primul={primul} telefon={telefonAndrei(azi)} />;
}
