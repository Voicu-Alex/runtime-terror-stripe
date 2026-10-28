// Inbox-ul din Monitorul Oficial pentru /admin: ce a propus modelul (data/inbox-mo.json) și ce a aprobat un om.
// Aprobarea ține doar id-ul și etichetele corectate; textul vine mereu din propunerea modelului.
// Se păstrează în localStorage, iar evenimentul „storage” duce aprobarea în celelalte taburi (fluxul) pe loc.
import inboxJson from "@/data/inbox-mo.json";
import type { Actiune, CineAplica, Directie, Incredere, Schimbare, Status, TipActiune } from "./catalog";
import { esteDestinatie } from "./destinatii";
import { esteTag, type TagId } from "./taguri";

type ActiuneModel = { tip: TipActiune; cine_aplica: CineAplica; text: string; termen: string | null; destinatie: string | null };

export type PropunereModel = {
  rezumat: string;
  taguri: string[];
  in_vigoare_de_la: string;
  pana_la: string | null;
  status: Status;
  directie: Directie;
  formula_tip: Schimbare["formula_tip"];
  articol: string;
  /** fraza din act pe care se sprijină propunerea, găsită textual (eval/scor.mjs) */
  citat: string;
  niveluri: { zero: string; curios: string; expert: string };
  actiuni: ActiuneModel[];
  incredere: Incredere;
  nota: string;
  /** traducerea pentru interfața în engleză, adăugată la revizie */
  en: { rezumat: string; zero: string; actiuni: string[]; nota: string } | null;
};

export type ActInbox = {
  cheie: string;
  act: string;
  mo: string;
  publicat_la: string;
  atinge_banii: boolean;
  sursa_url: string;
  titlu_en: string;
  schimbari: PropunereModel[];
};

export const INBOX = inboxJson as unknown as { sursa: string; model: string; cost_usd_pe_act: number; acte: ActInbox[] };

/** Id-ul cardului rezultat dintr-o propunere: stabil, ca aprobarea să supraviețuiască reîncărcării. */
export const idPropunere = (cheie: string, index: number) => `mo-${cheie}-${index}`;

export type Aprobare = { id: string; taguri: TagId[]; aprobat_la: string };

/** Propunerea modelului, cu etichetele alese de om, în forma unui act din catalog. */
export function inSchimbare(act: ActInbox, index: number, taguri: TagId[], aprobatLa: string): Schimbare {
  const p = act.schimbari[index];
  const actiuni: Actiune[] = p.actiuni.map((a, i) => ({
    text: a.text,
    text_en: p.en?.actiuni[i],
    termen: a.termen,
    formula_economie: null,
    one_click: null,
    tip: a.tip,
    cine_aplica: a.cine_aplica,
    destinatie: esteDestinatie(a.destinatie) ? a.destinatie : null,
  }));
  return {
    id: idPropunere(act.cheie, index),
    act: act.act,
    mo_ref: act.mo,
    rezumat: p.rezumat,
    rezumat_en: p.en?.rezumat,
    status: p.status,
    publicat_la: act.publicat_la,
    in_vigoare_de_la: p.in_vigoare_de_la,
    expira_la: p.pana_la,
    termen_actiune: actiuni.find((a) => a.termen)?.termen ?? null,
    directie: p.directie,
    taguri: taguri.filter(esteTag),
    conditii: [],
    formula: null,
    formula_tip: p.formula_tip ?? null,
    estimare: false,
    niveluri: { zero: p.niveluri.zero, zero_en: p.en?.zero, curios: p.niveluri.curios, expert: p.niveluri.expert },
    actiuni,
    profesionist: null,
    articol: p.articol,
    sursa_url: act.sursa_url,
    sursa_explicativa: "",
    incredere: p.incredere,
    verificat_la: aprobatLa,
  };
}

/** Actele aprobate, din aprobările salvate; o aprobare fără propunere (inbox schimbat) se ignoră. */
export function aprobateCaSchimbari(aprobari: Aprobare[]): Schimbare[] {
  const rezultat: Schimbare[] = [];
  for (const a of aprobari) {
    for (const act of INBOX.acte) {
      const i = act.schimbari.findIndex((_, k) => idPropunere(act.cheie, k) === a.id);
      if (i >= 0) rezultat.push(inSchimbare(act, i, a.taguri, a.aprobat_la));
    }
  }
  return rezultat;
}

export const CHEIE_APROBARI = "cipm.aprobate.v1";

export function incarcaAprobari(): Aprobare[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(CHEIE_APROBARI);
    const lista = brut ? (JSON.parse(brut) as Aprobare[]) : [];
    return Array.isArray(lista) ? lista.filter((a) => typeof a?.id === "string" && Array.isArray(a.taguri)) : [];
  } catch {
    return [];
  }
}

export function salveazaAprobari(lista: Aprobare[]): void {
  try {
    window.localStorage.setItem(CHEIE_APROBARI, JSON.stringify(lista));
  } catch {
    // storage blocat: aprobarea rămâne doar în pagina curentă
  }
}
