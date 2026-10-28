// Leagă de catalog conținutul colegilor:
//   content/niveluri.json     textele Zero / Curios / Expert (Iasmina, #7)
//   business/parteneri.json   furnizorii pentru butonul one-click (Haggy, #4)
//   content/modal-specialist.md + business/profesionisti.md  modalul „Găsește un specialist” (Chris, #5)
import niveluriJson from "@/content/niveluri.json";
import parteneriJson from "@/business/parteneri.json";
import type { Niveluri, Schimbare } from "./catalog";
import type { Limba } from "./i18n";
import { destinatie } from "./destinatii";

type NivelIasmina = Niveluri & { surse: string[] };
const NIVELURI = niveluriJson as Record<string, NivelIasmina>;

/** Cheile din content/niveluri.json sunt altele decât id-urile din catalog. */
const CHEIE_NIVELURI: Record<string, string> = {
  energie_plafon: "energie-plafon-2025",
  tva_21: "tva-2025",
  cass_pensii: "cass-pensii-2025",
  dividende_16: "dividende-2026",
  micro_1: "micro-2026",
  pilon2_plata: "pilon2-2027",
  gaz_plafon: "gaz-2026",
};

const eTODO = (s: string | undefined) => !s || s.trim() === "TODO";

/** Scoate propozițiile marcate TODO („Exemplu: TODO, ...”): nu afișăm ce n-are încă sursă. */
export function faraTODO(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((p) => !p.includes("TODO"))
    .join(" ")
    .trim();
}

export type NiveluriCard = {
  zero: string;
  /** limba propoziției de la Zero: în engleză doar unde catalogul are `zero_en` */
  limbaZero: Limba;
  curios: string | null;
  expert: string | null;
  surse: string[];
  autor: "continut" | "catalog";
};

/** Textele Iasminei au prioritate; unde lipsesc, rămân cele din catalog. Curios și Expert rămân în română. */
export function niveluri(s: Schimbare, limba: Limba = "ro"): NiveluriCard {
  const i = NIVELURI[CHEIE_NIVELURI[s.id]];
  const en = limba === "en" && s.niveluri.zero_en ? s.niveluri.zero_en : null;
  if (i) {
    return {
      zero: en ?? (faraTODO(i.zero) || s.niveluri.zero),
      limbaZero: en ? "en" : "ro",
      curios: faraTODO(i.curios) || null,
      expert: faraTODO(i.expert) || null,
      surse: i.surse ?? [],
      autor: "continut",
    };
  }
  return {
    zero: en ?? s.niveluri.zero,
    limbaZero: en ? "en" : "ro",
    curios: eTODO(s.niveluri.curios) ? null : s.niveluri.curios,
    expert: eTODO(s.niveluri.expert) ? null : s.niveluri.expert,
    surse: [],
    autor: "catalog",
  };
}

type Partener = { categorie: string; nume: string; url: string; program_afiliere: string };
const PARTENERI = parteneriJson as Partener[];

/** Ce categorie de furnizori are sens lângă fiecare act. */
const CATEGORIE: Record<string, string> = {
  energie_plafon: "energie_si_gaz",
  gaz_plafon: "energie_si_gaz",
};

export type Furnizor = { nume: string; url: string; comision: boolean };

/**
 * Furnizorii pentru un act, în ordine alfabetică: nu ordonăm după preț sau comision
 * (CLAUDE.md: nu recomandăm produse). Linkul oficial/comparatorul rămâne primul în card.
 */
export function furnizori(idSchimbare: string): Furnizor[] {
  const cat = CATEGORIE[idSchimbare];
  if (!cat) return [];
  return PARTENERI.filter((p) => p.categorie === cat)
    .map((p) => ({ nume: p.nume, url: p.url, comision: !p.program_afiliere.startsWith("fara_afiliere") }))
    .sort((a, b) => a.nume.localeCompare(b.nume, "ro"));
}

/** Registrele publice ale profesiilor, verificate pe site-urile oficiale pe 28 oct 2026. */
const REGISTRU_PROFESIE: Record<string, string> = { contabil: "ceccar_tablou", "consultant fiscal": "ccf_registru" };

/** Registrul profesiei vine din lista de destinații verificate (data/destinatii.json). */
function registru(profesie: string): { nume: string; url: string } | null {
  const d = destinatie(REGISTRU_PROFESIE[profesie]);
  return d?.url ? { nume: d.nume, url: d.url } : null;
}

export type Specialist = {
  profesie: string;
  intrebare: string | null;
  documente: string | null;
  registru: { nume: string; url: string } | null;
};

export function specialist(s: Schimbare): Specialist | null {
  if (!s.profesionist) return null;
  // Întrebarea și „ce să ai pregătit” stau în catalog, câmpul `specialist` (Voicu, #15).
  const d = s.specialist;
  return {
    profesie: s.profesionist,
    intrebare: d?.intrebare ?? null,
    documente: d?.documente ?? null,
    registru: registru(s.profesionist),
  };
}
