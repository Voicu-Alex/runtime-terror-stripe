import catalogJson from "@/data/catalog.json";
import { esteDestinatie, type DestinatieId } from "./destinatii";
import { esteFormula, type FormulaId } from "./formule";
import { esteFormulaTip, type FormulaTip } from "./formule-tip";
import type { CampConditie } from "./profil";
import { esteTag, type TagId } from "./taguri";

/** Formatul comun al unei schimbări din catalog (data/catalog.json). Îl folosesc toți. */

export type Directie = "cost" | "castig" | "termen" | "info";
export type Status = "proiect" | "adoptat" | "in_vigoare";
export type Incredere = "ridicata" | "medie" | "scazuta";
export type Operator = ">" | ">=" | "<" | "<=" | "==";

export type Conditie = {
  camp: CampConditie;
  op: Operator;
  valoare: number;
};

/** fa = omul are ceva de făcut; verifica = altcineva aplică legea, omul verifică; nimic_pana_la = nimic de făcut până la `termen` */
export type TipActiune = "fa" | "verifica" | "nimic_pana_la";
/** cine aplică schimbarea: omul însuși sau altcineva, automat */
export type CineAplica = "tu" | "angajator" | "furnizor" | "stat";
export const TIPURI_ACTIUNE: TipActiune[] = ["fa", "verifica", "nimic_pana_la"];
export const CINE_APLICA: CineAplica[] = ["tu", "angajator", "furnizor", "stat"];

export type Actiune = {
  text: string;
  /** traducerea textului, pentru interfața în engleză (pitch-ul); textul verificat rămâne `text` */
  text_en?: string;
  termen: string | null; // ISO, data până la care merită făcută
  /** economia pe lună dacă o faci; null = nu o estimăm */
  formula_economie: FormulaId | null;
  /** URL de partener pentru butonul one-click (task-ul lui Andrei și Haggy); null deocamdată */
  one_click: string | null;
  /** opționale pentru intrările vechi; obligatorii pentru propunerile noi (vezi eval/scor.mjs) */
  tip?: TipActiune;
  cine_aplica?: CineAplica;
  /** unde merge omul: un id din data/destinatii.json, niciodată un URL scris de model */
  destinatie?: DestinatieId | null;
};

/** Un act ulterior care a modificat actul din intrare. Forma la zi = intrarea + aceste modificări. */
export type Modificare = {
  act: string;
  mo_ref: string; // „MO 237 / 26 mar 2026” sau "TODO"
  data: string | null; // ISO, data publicării; null cât nu o știm
  ce: string; // ce a schimbat, o propoziție
  sursa_url: string; // linkul la textul actului modificator; "TODO" până îl găsește cineva
};

export type Niveluri = {
  zero: string; // o propoziție, fără jargon
  /** traducerea propoziției afișate la Zero (inclusiv când vine din content/niveluri.json), pentru pitch */
  zero_en?: string;
  curios: string; // 3–4 propoziții sau "TODO"
  expert: string; // articolul și nuanțele sau "TODO"
};

export type ComparatieAct = {
  inainte: string | null;
  acum: string;
  inainte_en?: string;
  acum_en?: string;
  sursa_url: string;
  articol: string;
  verificat_la: string;
};

export type Schimbare = {
  id: string;
  act: string;
  mo_ref: string;
  rezumat: string;
  /** titlul în engleză, scris de noi (lib/i18n.ts); textele legii rămân în română */
  rezumat_en?: string;
  /** Valorile din comparație au sursă; null la „înainte” înseamnă că valoarea veche nu e verificată. */
  comparatie?: ComparatieAct;
  status: Status;
  publicat_la: string; // ISO
  in_vigoare_de_la: string; // ISO
  expira_la: string | null;
  termen_actiune: string | null;
  directie: Directie;
  taguri: TagId[];
  conditii: Conditie[];
  formula: FormulaId | null;
  /** formulă parametrizată (lib/formule-tip.ts), folosită când `formula` e null */
  formula_tip?: FormulaTip | null;
  /** cifra e o medie sau un calcul propriu, nu din lege */
  estimare: boolean;
  niveluri: Niveluri;
  actiuni: Actiune[];
  /** tipul de specialist potrivit (task-ul lui Chris) sau null */
  profesionist: string | null;
  /** ce îl întrebi pe specialist și ce ai pregătit (content/modal-specialist.md); doar când profesionist nu e null */
  specialist?: { intrebare: string; documente: string };
  articol: string;
  /** linkul la textul actului; "TODO" până îl găsește cineva */
  sursa_url: string;
  sursa_explicativa: string;
  incredere: Incredere;
  verificat_la: string | null;
  /** actele ulterioare care au modificat acest act, în ordinea publicării (forma la zi) */
  modificat_prin?: Modificare[];
  /** id-urile din catalog pe care acest act le înlocuiește; ele ies din flux de la publicarea lui */
  inlocuieste?: string[];
};

/** Data formei la zi: publicarea actului sau a ultimei modificări cu dată cunoscută. */
export function actualizatLa(s: Schimbare): string {
  let data = s.publicat_la;
  for (const m of s.modificat_prin ?? []) if (m.data && m.data > data) data = m.data;
  return data;
}

export class CatalogInvalid extends Error {}

/** Verifică la încărcare că fiecare intrare folosește doar etichete și formule care există. */
export function valideazaCatalog(brut: unknown): Schimbare[] {
  if (!Array.isArray(brut)) throw new CatalogInvalid("catalogul trebuie să fie o listă");
  const ids = new Set<string>();
  const intrari = brut.map((s, i) => {
    const x = s as Record<string, unknown>;
    const unde = `intrarea ${i} (${String(x.id)})`;
    if (typeof x.id !== "string" || !x.id) throw new CatalogInvalid(`${unde}: lipsește id`);
    if (ids.has(x.id)) throw new CatalogInvalid(`${unde}: id dublat`);
    ids.add(x.id);
    if (x.comparatie != null) {
      const c = x.comparatie as Partial<ComparatieAct>;
      if ((c.inainte !== null && (typeof c.inainte !== 'string' || !c.inainte.trim()))
        || typeof c.acum !== 'string' || !c.acum.trim() || c.sursa_url !== x.sursa_url
        || typeof c.articol !== 'string' || !c.articol.trim()
        || typeof c.verificat_la !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(c.verificat_la)) {
        throw new CatalogInvalid(`${unde}: comparație fără valori sau sursă verificată`);
      }
    }
    if (!Array.isArray(x.taguri) || x.taguri.length === 0) throw new CatalogInvalid(`${unde}: fără etichete`);
    for (const t of x.taguri) if (!esteTag(t)) throw new CatalogInvalid(`${unde}: eticheta necunoscută „${String(t)}”`);
    if (x.formula != null && !esteFormula(x.formula)) throw new CatalogInvalid(`${unde}: formula necunoscută „${String(x.formula)}”`);
    if (x.formula_tip != null && !esteFormulaTip(x.formula_tip)) throw new CatalogInvalid(`${unde}: formula_tip invalidă`);
    for (const a of (x.actiuni as Actiune[]) ?? []) {
      if (a.formula_economie != null && !esteFormula(a.formula_economie))
        throw new CatalogInvalid(`${unde}: formula de economie necunoscută „${String(a.formula_economie)}”`);
      if (a.tip != null && !TIPURI_ACTIUNE.includes(a.tip)) throw new CatalogInvalid(`${unde}: tip de acțiune necunoscut „${String(a.tip)}”`);
      if (a.cine_aplica != null && !CINE_APLICA.includes(a.cine_aplica))
        throw new CatalogInvalid(`${unde}: cine_aplica necunoscut „${String(a.cine_aplica)}”`);
      if (a.tip === "nimic_pana_la" && !a.termen) throw new CatalogInvalid(`${unde}: „nimic_pana_la” cere un termen`);
      if (a.destinatie != null) {
        if (a.tip == null) throw new CatalogInvalid(`${unde}: destinația cere și tipul acțiunii`);
        if (!esteDestinatie(a.destinatie)) throw new CatalogInvalid(`${unde}: destinație necunoscută „${String(a.destinatie)}”`);
      }
    }
    for (const c of (x.conditii as Conditie[]) ?? []) {
      if (![">", ">=", "<", "<=", "=="].includes(c.op)) throw new CatalogInvalid(`${unde}: operator necunoscut „${c.op}”`);
    }
    return x as unknown as Schimbare;
  });
  for (const s of intrari) {
    for (const id of s.inlocuieste ?? [])
      if (!ids.has(id)) throw new CatalogInvalid(`intrarea ${s.id}: înlocuiește un id care nu există „${id}”`);
  }
  return intrari;
}

export const CATALOG: Schimbare[] = valideazaCatalog(catalogJson);

export function gasesteSchimbarea(id: string): Schimbare | undefined {
  return CATALOG.find((s) => s.id === id);
}

/** Textul acțiunii în limba interfeței; fără traducere, rămâne textul românesc. */
export function textActiune(a: Pick<Actiune, "text" | "text_en">, limba: "ro" | "en"): string {
  return limba === "en" && a.text_en ? a.text_en : a.text;
}
