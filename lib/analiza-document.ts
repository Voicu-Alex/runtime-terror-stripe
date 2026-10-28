import type { Valori } from "./profil";
import { TAGURI, TOATE_TAGURILE, type TagId } from "./taguri";

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

/** Schema tool-ului dat modelului: etichetele sunt un enum, deci nu poate inventa altele. */
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
          incredere: { type: "number", minimum: 0, maximum: 1 },
          motiv: { type: "string", description: "o propoziție: ce din document susține eticheta" },
        },
      },
    },
    valori: {
      type: "object",
      additionalProperties: false,
      properties: {
        salariu_net: { type: "number", description: "lei pe lună, doar dacă scrie explicit" },
        salariu_brut: { type: "number", description: "lei pe lună, doar dacă scrie explicit" },
        pensie_lunara: { type: "number" },
        dividende_anuale: { type: "number" },
        cheltuieli_lunare: { type: "number" },
        an_nastere: { type: "number", description: "doar anul, dacă apare data nașterii; nu copia data completă" },
        nr_copii: { type: "number", description: "doar dacă documentul îi menționează explicit (de exemplu persoane în întreținere)" },
        furnizor: { type: "string", description: "numele furnizorului de pe factură (Engie, E.ON, Orange etc.)" },
        suma_factura: { type: "number", description: "totalul de plată de pe factură, în lei" },
        chirie_lunara: { type: "number", description: "chiria lunară dintr-un contract de închiriere, în lei" },
      },
    },
    explicatie_scurta: { type: "string", description: "2–3 propoziții simple: ce ai găsit în document" },
  },
} as const;

export const INSTRUCTIUNI_MODEL = `Ești modulul de extragere al aplicației „Ce înseamnă pentru mine”. Primești un document personal (contract de muncă, factură de utilități, fluturaș de salariu sau altceva) și întorci DOAR etichete din lista fixă și valori citite din document.

Lista de etichete și ce înseamnă:
${TOATE_TAGURILE.map((t) => `- ${t}: ${TAGURI[t].eticheta} (familia „${TAGURI[t].familie}”)`).join("\n")}

Reguli:
1. Propui o etichetă doar dacă documentul o susține direct. Un contract de muncă susține „angajat”; dacă angajatorul e din IT, și „it”. O factură de gaz susține „consumator_gaz”; una de curent, „consumator_energie”. Un cupon de pensie susține „pensionar”.
2. Nu deduce lucruri care nu sunt în document (de exemplu „pilon2” doar pentru că omul e angajat). Dacă nu ești sigur, dă încredere sub 0,5 și explică în motiv.
3. Valorile numerice le copiezi exact cum scriu în document, în lei, fără să calculezi nimic. Nu estima, nu rotunji, nu converti.
4. Nu întoarce niciodată CNP, IBAN, serie de buletin, adresă sau număr de telefon, nici în motiv, nici în explicație.
5. Nu dai sfaturi și nu interpretezi legea. Doar spui ce ai găsit.
6. Scrii în română simplă, fără jargon, fără cratime de tipul „X — Y”.`;
