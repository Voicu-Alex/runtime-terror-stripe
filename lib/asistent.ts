/**
 * Asistentul de profil: cele 6 întrebări din content/parcurs.md §2, starea conversației și
 * contractul API pentru /api/asistent. Logică pură, fără React și fără rețea.
 *
 * Regula produsului (CLAUDE.md): modelul nu inventează etichete și nu calculează sume.
 * Etichetele vin doar din lib/taguri.ts; sumele vin doar din motor (lib/potrivire.ts).
 */
import type { Familie, TagId } from "./taguri";
import type { Profil } from "./profil";

/** O etichetă extrasă, cu cuvântul din care a venit („IT din «programator»”). `din` lipsește la butoane. */
export type Extrasa = { tag: TagId; din?: string };

export type RaspunsRapid = { eticheta: string; taguri: TagId[] };

export type Intrebare = {
  pas: 1 | 2 | 3 | 4 | 5 | 6;
  familie: Familie;
  /** Cheia i18n este textul românesc. */
  text: string;
  multiple: boolean;
  raspunsuri: RaspunsRapid[];
};

/** Textele sunt cele din content/parcurs.md §2, neschimbate. „Nu știu ce e Pilonul II” lipsește: explicația nu are încă sursă ASF. */
export const INTREBARI: readonly Intrebare[] = [
  {
    pas: 1,
    familie: "venit",
    text: "Din ce îți vin banii în fiecare lună?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Salariu", taguri: ["angajat"] },
      { eticheta: "PFA", taguri: ["pfa"] },
      { eticheta: "Dividende din SRL", taguri: ["srl_dividende"] },
      { eticheta: "Pensie", taguri: ["pensionar"] },
    ],
  },
  {
    pas: 2,
    familie: "domeniu",
    text: "În ce domeniu lucrezi?",
    multiple: false,
    raspunsuri: [
      { eticheta: "IT", taguri: ["it"] },
      { eticheta: "Construcții", taguri: ["constructii"] },
      { eticheta: "HoReCa", taguri: ["horeca"] },
      { eticheta: "Transport", taguri: ["transport"] },
      { eticheta: "Sănătate", taguri: ["sanatate"] },
      { eticheta: "Agricultură", taguri: ["agricultura"] },
      { eticheta: "Altul", taguri: [] },
    ],
  },
  {
    pas: 3,
    familie: "conduc",
    text: "Ai o firmă sau un PFA pe numele tău?",
    multiple: false,
    raspunsuri: [
      { eticheta: "SRL microîntreprindere", taguri: ["micro"] },
      { eticheta: "PFA", taguri: ["pfa"] },
      { eticheta: "Nu am", taguri: [] },
    ],
  },
  {
    pas: 4,
    familie: "detin",
    text: "Ce ai pe numele tău?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Apartament sau casă", taguri: ["proprietar"] },
      { eticheta: "Mașină", taguri: ["masina"] },
      { eticheta: "Pilon II", taguri: ["pilon2"] },
      { eticheta: "Pilon III", taguri: ["pilon3"] },
    ],
  },
  {
    pas: 5,
    familie: "locuinta",
    text: "Unde stai și cu ce te încălzești?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Chirie", taguri: ["chirias"] },
      { eticheta: "Casa mea", taguri: ["proprietar"] },
      { eticheta: "Am ipotecă", taguri: ["ipoteca"] },
      { eticheta: "Încălzire pe gaz", taguri: ["consumator_gaz"] },
    ],
  },
  {
    pas: 6,
    familie: "familie",
    text: "Ai pe cineva în grijă?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Copii", taguri: ["parinte"] },
      { eticheta: "Părinți", taguri: ["intretin_parinti"] },
      { eticheta: "Nu", taguri: [] },
    ],
  },
];

export const MESAJ_START = "Îți pun 6 întrebări scurte. Răspunzi cu o atingere sau în cuvintele tale. Poți sări peste oricare.";
export const MESAJ_NEINTELES = "Nu am găsit o etichetă în ce ai scris. Alege de mai jos sau sari peste.";
export const SAR_PESTE = "Sar peste";

/** Pasul 3 se sare automat dacă la pasul 1 nu s-a ales una din acestea (parcurs.md §2, nota 1). */
export const TAGURI_FIRMA: readonly TagId[] = ["pfa", "pfa_norma", "srl_dividende"];

export type Mesaj =
  | { rol: "asistent"; text: string }
  | { rol: "om"; text: string }
  | { rol: "etichete"; etichete: Extrasa[] };

export type Stare = {
  /** 1..6; 7 = terminat. */
  pas: number;
  /** Acumulat, fără duplicate pe tag. */
  extrase: Extrasa[];
  mesaje: Mesaj[];
  terminat: boolean;
};

export function porneste(): Stare {
  throw new Error("TODO");
}

export function intrebareaCurenta(s: Stare): Intrebare | null {
  void s;
  throw new Error("TODO");
}

export function raspundeRapid(s: Stare, r: RaspunsRapid[]): Stare {
  void s;
  void r;
  throw new Error("TODO");
}

/** După ce API-ul a extras etichetele din textul liber. Dacă `extrase` e gol, rămâne pe același pas cu MESAJ_NEINTELES. */
export function raspundeLiber(s: Stare, textOm: string, extrase: Extrasa[]): Stare {
  void s;
  void textOm;
  void extrase;
  throw new Error("TODO");
}

export function sarPeste(s: Stare): Stare {
  void s;
  throw new Error("TODO");
}

/** Scoate eticheta din `extrase` și din toate mesajele „etichete”. */
export function scoate(s: Stare, tag: TagId): Stare {
  void s;
  void tag;
  throw new Error("TODO");
}

/** „Gata. Am notat: salariu, IT, …. Le poți schimba oricând din Profil.” (parcurs.md §2, mesajul de final) */
export function rezumat(s: Stare): string {
  void s;
  throw new Error("TODO");
}

export function inProfil(s: Stare, existent: Profil): Profil {
  void s;
  void existent;
  throw new Error("TODO");
}

/* ---------- Contract API: /api/asistent ---------- */

export type CerereProfil = { mod: "profil"; text: string; pas: number; taguri: TagId[] };
/** `mesaj`: o propoziție de confirmare în vocea B (docs/voce.md §9), fără sume. */
export type RaspunsProfil = { etichete: Extrasa[]; mesaj: string };

export type MesajIstoric = { rol: "asistent" | "om"; text: string };
export type CerereLege = { mod: "lege"; id: string; profil: Profil; istoric: MesajIstoric[]; intrebare: string };
/** `text`: 2–3 propoziții; se termină cu actul și articolul sau „încă nu am verificat”. `sursa` o pune serverul din catalog, nu modelul. */
export type RaspunsLege = { text: string; sursa: { act: string; articol?: string; url?: string } | null };

export type CerereAsistent = CerereProfil | CerereLege;

/** Validare la runtime: mod, câmpuri, taguri ∈ TOATE_TAGURILE, profil prin normalizeaza(). */
export function esteCerere(x: unknown): x is CerereAsistent {
  void x;
  throw new Error("TODO");
}
