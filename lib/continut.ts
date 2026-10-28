// Leagă de catalog conținutul colegilor:
//   content/niveluri.json     textele Zero / Curios / Expert (Iasmina, #7)
//   business/parteneri.json   furnizorii pentru butonul one-click (Haggy, #4)
//   content/modal-specialist.md + business/profesionisti.md  modalul „Găsește un specialist” (Chris, #5)
import niveluriJson from "@/content/niveluri.json";
import parteneriJson from "@/business/parteneri.json";
import type { Niveluri, Schimbare } from "./catalog";

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

export type NiveluriCard = { zero: string; curios: string | null; expert: string | null; surse: string[]; autor: "continut" | "catalog" };

/** Textele Iasminei au prioritate; unde lipsesc, rămân cele din catalog. */
export function niveluri(s: Schimbare): NiveluriCard {
  const i = NIVELURI[CHEIE_NIVELURI[s.id]];
  if (i) {
    return {
      zero: faraTODO(i.zero) || s.niveluri.zero,
      curios: faraTODO(i.curios) || null,
      expert: faraTODO(i.expert) || null,
      surse: i.surse ?? [],
      autor: "continut",
    };
  }
  return {
    zero: s.niveluri.zero,
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
const REGISTRU: Record<string, { nume: string; url: string }> = {
  contabil: { nume: "Tabloul membrilor CECCAR", url: "https://ceccar.ro/ro/?page_id=97" },
  "consultant fiscal": {
    nume: "Registrul membrilor Camerei Consultanților Fiscali",
    url: "https://www.ccfiscali.ro/registrul-membrilor-ccf/toti-membrii-ccf/",
  },
};

/** Întrebarea tipică și ce să ai pregătit, din tabelul din business/profesionisti.md. */
const SPECIALIST: Record<string, { intrebare: string; documente: string | null }> = {
  dividende_16: {
    intrebare: "Mai merită să îmi iau banii din SRL ca dividende sau pe salariu, cu impozitul de 16%?",
    documente: "Profitul estimat pe anul acesta și cât ai vrea să scoți din firmă.",
  },
  micro_1: { intrebare: "Ce se întâmplă dacă depășesc plafonul la jumătatea anului?", documente: null },
  horeca_tva_11: {
    intrebare: "Ce cotă pun pe facturile emise după 1 august? Ce fac cu contractele în curs?",
    documente: null,
  },
  pilon2_plata: { intrebare: "Iau 30% odată sau totul eșalonat?", documente: null },
};

export type Specialist = {
  profesie: string;
  intrebare: string | null;
  documente: string | null;
  registru: { nume: string; url: string } | null;
};

export function specialist(s: Schimbare): Specialist | null {
  if (!s.profesionist) return null;
  const d = SPECIALIST[s.id];
  return {
    profesie: s.profesionist,
    intrebare: d?.intrebare ?? null,
    documente: d?.documente ?? null,
    registru: REGISTRU[s.profesionist] ?? null,
  };
}
