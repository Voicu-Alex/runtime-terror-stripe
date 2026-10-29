import type { Valori } from "./profil";
import { TAGURI, TOATE_TAGURILE, type TagId } from "./taguri";
import { VOCE_ASISTENT } from "./voce";

/** Contractul dintre ruta de API și pagina /documente. Doar extragere; nicio sumă calculată, niciun sfat. */

export const TIPURI_DOCUMENT = ["contract_munca", "factura_utilitati", "fluturas_salariu", "altul"] as const;
export type TipDocument = (typeof TIPURI_DOCUMENT)[number];

export type EtichetaPropusa = {
  tag: TagId;
  /** 0–1 */
  incredere: number;
  motiv: string;
};

export type ValoriExtrase = Valori & {
  furnizor?: string;
  suma_factura?: number;
  chirie_lunara?: number;
};

export type AnalizaDocument = {
  /** „claude” = analiză reală; „demo” = răspuns pregătit, fără apel la model */
  mod: "claude" | "demo";
  tip_document: TipDocument;
  etichete_propuse: EtichetaPropusa[];
  valori: ValoriExtrase;
  explicatie_scurta: string;
};

export const TIPURI_FISIER_ACCEPTATE = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MARIME_MAXIMA = 10 * 1024 * 1024;

export const CAMPURI_VALORI_DOCUMENT = [
  "salariu_net",
  "salariu_brut",
  "pensie_lunara",
  "dividende_anuale",
  "cheltuieli_lunare",
  "an_nastere",
  "nr_copii",
  "furnizor",
  "suma_factura",
  "chirie_lunara",
] as const;

/** Păstrează doar valorile citite efectiv: null, 0 și textul gol înseamnă „nu apare pe document”. */
export function curataValori(v: Record<string, unknown> | null | undefined): ValoriExtrase {
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(v ?? {})) {
    if (x === null || x === 0 || (typeof x === "string" && x.trim() === "")) continue;
    out[k] = x;
  }
  return out as ValoriExtrase;
}

/** Schema dată modelului: etichetele sunt un enum, deci nu poate inventa altele. */
export const SCHEMA_ANALIZA = {
  type: "object",
  additionalProperties: false,
  required: ["tip_document", "etichete_propuse", "valori", "explicatie_scurta"],
  properties: {
    tip_document: { type: "string", enum: [...TIPURI_DOCUMENT] },
    etichete_propuse: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["tag", "incredere", "motiv"],
        properties: {
          tag: { type: "string", enum: TOATE_TAGURILE },
          // structured outputs nu acceptă minimum/maximum pe number: intervalul e în descriere și se forțează în rută
          incredere: { type: "number", description: "între 0 și 1" },
          motiv: { type: "string", description: "o propoziție: ce din document susține eticheta" },
        },
      },
    },
    // Toate câmpurile sunt obligatorii, dar pot fi null: cu câmpuri opționale, modelul (prin API real,
    // 28 oct 2026) omitea salariul net de pe fluturaș și completa câmpurile fără legătură cu 0 sau "".
    // Ruta păstrează doar valorile care nu sunt null, 0 sau text gol.
    valori: {
      type: "object",
      additionalProperties: false,
      required: [...CAMPURI_VALORI_DOCUMENT],
      properties: {
        salariu_net: { type: ["number", "null"], description: "lei pe lună, dacă scrie pe document; altfel null" },
        salariu_brut: { type: ["number", "null"], description: "lei pe lună, dacă scrie pe document; altfel null" },
        pensie_lunara: { type: ["number", "null"], description: "cuantumul pensiei, lei pe lună; altfel null" },
        dividende_anuale: { type: ["number", "null"], description: "lei pe an; altfel null" },
        cheltuieli_lunare: { type: ["number", "null"], description: "doar dacă documentul le spune explicit; altfel null" },
        an_nastere: { type: ["number", "null"], description: "doar anul, dacă apare data nașterii; nu copia data completă; altfel null" },
        nr_copii: { type: ["number", "null"], description: "doar dacă documentul îi menționează explicit; altfel null" },
        furnizor: { type: ["string", "null"], description: "numele furnizorului de pe o factură de utilități; altfel null" },
        suma_factura: { type: ["number", "null"], description: "totalul de plată de pe o factură de utilități, în lei; altfel null" },
        chirie_lunara: { type: ["number", "null"], description: "chiria lunară dintr-un contract de închiriere, în lei; altfel null" },
      },
    },
    explicatie_scurta: { type: "string", description: "2–3 propoziții simple: ce ai găsit în document" },
  },
} as const;

export const INSTRUCTIUNI_MODEL = `Ești modulul de extragere al aplicației „Ce înseamnă pentru mine”. Primești un document personal (contract de muncă, factură de utilități, fluturaș de salariu sau altceva) și întorci DOAR etichete din lista fixă și valori citite din document.

Lista de etichete și ce înseamnă:
${TOATE_TAGURILE.map((t) => `- ${t}: ${TAGURI[t].eticheta} (familia „${TAGURI[t].familie}”)`).join("\n")}

Vocea asistentului:
${VOCE_ASISTENT}

Reguli:
1. Propui o etichetă doar dacă documentul o susține direct. Un contract de muncă susține „angajat”; dacă angajatorul e din IT, și „it”. O factură de gaz susține „consumator_gaz”; una de curent, „consumator_energie”. Un cupon de pensie susține „pensionar”.
2. Nu deduce lucruri care nu sunt în document (de exemplu „pilon2” doar pentru că omul e angajat). Dacă nu ești sigur, dă încredere sub 0,5 și explică în motiv.
3. Valorile numerice le copiezi exact cum scriu în document, în lei, fără să calculezi nimic. Nu estima, nu rotunji, nu converti.
4. Nu întoarce niciodată CNP, IBAN, serie de buletin, adresă sau număr de telefon, nici în motiv, nici în explicație.
5. Nu dai sfaturi și nu interpretezi legea. Doar spui ce ai găsit.
6. Scrii în română simplă, fără jargon, fără cratime de tipul „X — Y”.
7. Etichetele descriu persoana care și-a încărcat documentul: salariatul din contract sau fluturaș, clientul de pe factură, pensionarul de pe cupon, chiriașul din contractul de închiriere. Nu pune etichetele celeilalte părți (angajatorul, furnizorul, proprietarul care închiriază).
8. Pe fluturaș, dacă apar ambele, completezi și salariu_brut, și salariu_net. Pe cuponul de pensie, pensie_lunara este cuantumul pensiei înainte de rețineri (CASS, impozit), nu suma încasată.
9. Extrasele de cont nu le folosim: dacă documentul e un extras bancar, întorci tip_document „altul”, nicio etichetă, nicio valoare, iar în explicație spui că aplicația nu folosește extrase de cont. Nu deduci etichete din tranzacții (o plată către un furnizor nu dovedește cine e omul).
10. Nu propui o etichetă ca să spui că nu se potrivește: dacă documentul arată că eticheta nu e a omului (de exemplu adresa e la oraș, deci nu „rural”), pur și simplu nu o pui în listă.`;
