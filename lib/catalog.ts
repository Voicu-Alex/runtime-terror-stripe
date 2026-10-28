import catalogJson from "@/data/catalog.json";
import { esteFormula, type FormulaId } from "./formule";
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

export type Actiune = {
  text: string;
  termen: string | null; // ISO, data până la care merită făcută
  /** economia pe lună dacă o faci; null = nu o estimăm */
  formula_economie: FormulaId | null;
  /** URL de partener pentru butonul one-click (task-ul lui Andrei și Haggy); null deocamdată */
  one_click: string | null;
};

export type Niveluri = {
  zero: string; // o propoziție, fără jargon
  curios: string; // 3–4 propoziții sau "TODO"
  expert: string; // articolul și nuanțele sau "TODO"
};

export type Schimbare = {
  id: string;
  act: string;
  mo_ref: string;
  rezumat: string;
  status: Status;
  publicat_la: string; // ISO
  in_vigoare_de_la: string; // ISO
  expira_la: string | null;
  termen_actiune: string | null;
  directie: Directie;
  taguri: TagId[];
  conditii: Conditie[];
  formula: FormulaId | null;
  /** cifra e o medie sau un calcul propriu, nu din lege */
  estimare: boolean;
  niveluri: Niveluri;
  actiuni: Actiune[];
  /** tipul de specialist potrivit (task-ul lui Chris) sau null */
  profesionist: string | null;
  articol: string;
  /** linkul la textul actului; "TODO" până îl găsește cineva */
  sursa_url: string;
  sursa_explicativa: string;
  incredere: Incredere;
  verificat_la: string | null;
};

export class CatalogInvalid extends Error {}

/** Verifică la încărcare că fiecare intrare folosește doar etichete și formule care există. */
export function valideazaCatalog(brut: unknown): Schimbare[] {
  if (!Array.isArray(brut)) throw new CatalogInvalid("catalogul trebuie să fie o listă");
  const ids = new Set<string>();
  return brut.map((s, i) => {
    const x = s as Record<string, unknown>;
    const unde = `intrarea ${i} (${String(x.id)})`;
    if (typeof x.id !== "string" || !x.id) throw new CatalogInvalid(`${unde}: lipsește id`);
    if (ids.has(x.id)) throw new CatalogInvalid(`${unde}: id dublat`);
    ids.add(x.id);
    if (!Array.isArray(x.taguri) || x.taguri.length === 0) throw new CatalogInvalid(`${unde}: fără etichete`);
    for (const t of x.taguri) if (!esteTag(t)) throw new CatalogInvalid(`${unde}: eticheta necunoscută „${String(t)}”`);
    if (x.formula != null && !esteFormula(x.formula)) throw new CatalogInvalid(`${unde}: formula necunoscută „${String(x.formula)}”`);
    for (const a of (x.actiuni as Actiune[]) ?? []) {
      if (a.formula_economie != null && !esteFormula(a.formula_economie))
        throw new CatalogInvalid(`${unde}: formula de economie necunoscută „${String(a.formula_economie)}”`);
    }
    for (const c of (x.conditii as Conditie[]) ?? []) {
      if (![">", ">=", "<", "<=", "=="].includes(c.op)) throw new CatalogInvalid(`${unde}: operator necunoscut „${c.op}”`);
    }
    return x as unknown as Schimbare;
  });
}

export const CATALOG: Schimbare[] = valideazaCatalog(catalogJson);

export function gasesteSchimbarea(id: string): Schimbare | undefined {
  return CATALOG.find((s) => s.id === id);
}
