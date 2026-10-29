import type { Actiune, CineAplica, Conditie, Directie, Incredere, Niveluri, Schimbare, Status, TipActiune } from "./catalog";
import type { FormulaId } from "./formule";
import type { FormulaTip } from "./formule-tip";
import type { IntrareGhid } from "./ghid";
import { TAGURI, esteTag, type TagId } from "./taguri";

/**
 * Din interpretarea modelului (eval/interpretare/instructiuni.md, v3) în intrările pe care le citește aplicația:
 * `Schimbare` (data/catalog.json) și `IntrareGhid` (data/ghid.json). Funcții pure; scrierea fișierelor și a
 * bazei e în lib/aprobare.ts. Tipurile de mai jos descriu ce întoarce modelul, nu ce acceptă catalogul: câmpurile
 * sunt largi (string), iar lib/verificari-interpretare.ts verifică înainte de aprobare că valorile sunt valide.
 */

/** Un act din tabelul `acte` (supabase/acte.sql). */
export type ActBrut = {
  id: string;
  sursa: string;
  sursa_id: string;
  url: string;
  mo_ref: string | null;
  publicat_la: string | null;
  titlu: string;
  text: string | null;
  tip_act?: string | null;
  numar?: string | null;
  an?: number | null;
};

export type ActiuneInterpretata = {
  tip: string;
  cine_aplica: string;
  text: string;
  termen: string | null;
  destinatie: string | null;
  /** o destinație care nu e în data/destinatii.json; un om o verifică */
  destinatie_propusa?: string | null;
};

export type ConditieInterpretata = { camp: string; op: string; valoare: number };

export type SchimbareInterpretata = {
  rezumat: string;
  /** apar din v3; la rezultatele v2 lipsesc */
  rezumat_en?: string;
  taguri: string[];
  in_vigoare_de_la: string;
  pana_la: string | null;
  termen_actiune?: string | null;
  status: string;
  directie: string;
  conditii?: ConditieInterpretata[];
  formula: string | null;
  formula_tip: FormulaTip | null;
  articol: string;
  citat: string;
  niveluri: Niveluri;
  actiuni: ActiuneInterpretata[];
  incredere: string;
  nota: string | null;
};

/** Obiectul JSON întors de model, salvat în `interpretari.rezultat`. */
export type InterpretareAct = {
  act: string;
  mo: string;
  publicat_la: string;
  atinge_banii: boolean;
  schimbari: SchimbareInterpretata[];
};

const LEGATURI = new Set([
  "a", "al", "ale", "cu", "de", "din", "doar", "este", "in", "la", "mai", "nu", "o", "pe", "pentru", "prin", "se", "si", "sa", "un", "unei", "unui", "va",
]);

/** Fără diacritice, litere mici, doar a-z0-9 și spațiu. */
function faraDiacritice(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function schimbareaDeLa(interp: InterpretareAct, i: number): SchimbareInterpretata {
  const s = interp.schimbari[i];
  if (!s) throw new Error(`schimbarea ${i} nu există (interpretarea are ${interp.schimbari.length})`);
  return s;
}

/**
 * Id-ul din catalog: primele cuvinte ale titlului (fără legături și fără cifre) + anul intrării în vigoare,
 * ca „salariu_minim_2026”. Dacă există deja, se adaugă _2, _3...
 */
export function idSchimbare(interp: InterpretareAct, i: number, act: ActBrut, existente: Iterable<string> = []): string {
  const s = schimbareaDeLa(interp, i);
  const cuvinte = faraDiacritice(s.rezumat)
    .split(" ")
    .filter((c) => c.length > 1 && !LEGATURI.has(c) && !/^\d+$/.test(c));
  const an = (s.in_vigoare_de_la || act.publicat_la || interp.publicat_la || "").slice(0, 4);
  let baza = cuvinte.slice(0, 3).join("_");
  if (!baza) baza = "schimbare";
  if (/^\d{4}$/.test(an)) baza = `${baza}_${an}`;
  baza = baza.slice(0, 48).replace(/_+$/, "");
  const luate = new Set(existente);
  if (!luate.has(baza)) return baza;
  for (let n = 2; ; n++) if (!luate.has(`${baza}_${n}`)) return `${baza}_${n}`;
}

export type OptiuniSchimbare = {
  /** data verificării umane (ISO) */
  verificat_la: string;
  /** id-urile deja luate în catalog (și în același lot de aprobat) */
  existente: Iterable<string>;
};

/**
 * Maparea unei schimbări propuse la intrarea din catalog. Ce nu are loc în catalog (destinatia_propusa) merge
 * în `niveluri.expert` după „De verificat:”; citatul stă lângă articol ca revizorul să-l vadă.
 * `in_vigoare_de_la` lipsă cade pe data publicării (verificarea o marchează oricum ca picată).
 */
export function spreSchimbare(interp: InterpretareAct, i: number, act: ActBrut, optiuni: OptiuniSchimbare): Schimbare {
  const s = schimbareaDeLa(interp, i);
  const publicat_la = act.publicat_la ?? interp.publicat_la;
  const propuse = [...new Set(s.actiuni.map((a) => a.destinatie_propusa?.trim()).filter((x): x is string => !!x))];
  const niveluri: Niveluri = {
    ...s.niveluri,
    expert: propuse.length ? `${s.niveluri.expert} ${propuse.map((p) => `De verificat: ${p}.`).join(" ")}` : s.niveluri.expert,
  };
  const actiuni: Actiune[] = s.actiuni.map((a) => ({
    text: a.text,
    termen: a.termen ?? null,
    formula_economie: null,
    one_click: null,
    tip: a.tip as TipActiune,
    cine_aplica: a.cine_aplica as CineAplica,
    destinatie: a.destinatie ?? null,
  }));
  const fara_suma = s.formula == null && s.formula_tip == null;
  const intrare: Schimbare = {
    id: idSchimbare(interp, i, act, optiuni.existente),
    act: interp.act,
    mo_ref: act.mo_ref ?? interp.mo,
    rezumat: s.rezumat,
    status: s.status as Status,
    publicat_la,
    in_vigoare_de_la: s.in_vigoare_de_la || publicat_la,
    expira_la: s.pana_la ?? null,
    termen_actiune: s.termen_actiune ?? null,
    directie: s.directie as Directie,
    taguri: s.taguri as TagId[],
    conditii: (s.conditii ?? []) as Conditie[],
    formula: (s.formula ?? null) as FormulaId | null,
    estimare: fara_suma || /estim/i.test(s.nota ?? ""),
    niveluri,
    actiuni,
    profesionist: null,
    articol: s.citat ? `${s.articol} · citat: „${s.citat}”` : s.articol,
    sursa_url: act.url,
    sursa_explicativa: "",
    incredere: s.incredere as Incredere,
    verificat_la: optiuni.verificat_la,
  };
  if (s.rezumat_en) intrare.rezumat_en = s.rezumat_en;
  intrare.formula_tip = s.formula_tip ?? null;
  return intrare;
}

/** Intrarea din ghid: fără sume (nu avem una cu sursă), cu pașii din acțiuni. */
export function spreGhid(schimbare: Schimbare, interp: InterpretareAct, i: number): IntrareGhid {
  const s = schimbareaDeLa(interp, i);
  const etichete = schimbare.taguri.map((t) => (esteTag(t) ? TAGURI[t].eticheta : t));
  const pasi = schimbare.actiuni.map((a) => a.text);
  const g: IntrareGhid = {
    id: schimbare.id,
    pentru: `Pentru cine are: ${etichete.join(", ")}`,
    ce: schimbare.rezumat,
    salvezi: null,
    pierzi: null,
    termen: schimbare.termen_actiune,
    pasi: pasi.length ? pasi : [schimbare.niveluri.zero],
    solutie: null,
  };
  if (s.nota) g.nota = s.nota;
  return g;
}
