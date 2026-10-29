// Engleza pentru textele din date (catalog, ghid, destinații), din data/traduceri-en.json.
// Stă separat de catalog.json și ghid.json ca să nu intre în conflict cu cine editează textul românesc.
// Româna e textul verificat; unde lipsește traducerea, rămâne româna (și `lang` spune asta).
import traduceriJson from "@/data/traduceri-en.json";
import type { Modificare, Schimbare } from "./catalog";
import type { IntrareGhid, Suma } from "./ghid";
import type { Limba } from "./i18n";

type SumaEn = { perioada?: string; ipoteza: string };

export type ActEn = {
  act: string;
  mo_ref: string;
  articol: string;
  curios?: string;
  expert?: string;
  specialist?: { intrebare: string; documente: string };
  /** în ordinea din catalog */
  modificat_prin?: { act: string; mo_ref?: string; ce: string }[];
};

export type GhidEn = {
  pentru: string;
  ce: string;
  salvezi?: SumaEn;
  pierzi?: SumaEn;
  pasi: string[];
  solutie?: { nume: string; ce: string };
  nota?: string;
};

type Traduceri = { acte: Record<string, ActEn>; ghid: Record<string, GhidEn>; destinatii: Record<string, string> };
export const TRADUCERI = traduceriJson as unknown as Traduceri;

/** Un text și limba în care e scris de fapt, pentru atributul `lang`. */
export type Text = { text: string; limba: Limba };

function alege(limba: Limba, ro: string, en: string | undefined): Text {
  return limba === "en" && en ? { text: en, limba: "en" } : { text: ro, limba: "ro" };
}

export function actEn(id: string): ActEn | undefined {
  return TRADUCERI.acte[id];
}

/** Numele actului, Monitorul Oficial și articolul, cum apar sub fiecare card. */
export function sursaAct(s: Schimbare, limba: Limba): { act: Text; mo_ref: Text; articol: Text } {
  const en = actEn(s.id);
  return { act: alege(limba, s.act, en?.act), mo_ref: alege(limba, s.mo_ref, en?.mo_ref), articol: alege(limba, s.articol, en?.articol) };
}

/** Actele care au modificat intrarea, cu textul „ce schimbă” în limba cerută. */
export function modificari(s: Schimbare, limba: Limba): (Modificare & { limba: Limba })[] {
  const en = actEn(s.id)?.modificat_prin;
  return (s.modificat_prin ?? []).map((m, i) => {
    const e = limba === "en" ? en?.[i] : undefined;
    return e ? { ...m, act: e.act, mo_ref: e.mo_ref ?? m.mo_ref, ce: e.ce, limba: "en" as Limba } : { ...m, limba: "ro" as Limba };
  });
}

export function numeDestinatie(id: string, nume: string, limba: Limba): Text {
  return alege(limba, nume, TRADUCERI.destinatii[id]);
}

/** `perioada` („în primul an”) se traduce doar unde româna o are. */
function suma(ro: Suma | null, en: SumaEn | undefined): Suma | null {
  if (!ro || !en) return ro;
  const perioada = (ro as Suma & { perioada?: string }).perioada;
  return { ...ro, ipoteza: en.ipoteza, ...(perioada ? { perioada: en.perioada ?? perioada } : {}) };
}

/** Intrarea din /legi în limba cerută; `limba` spune dacă a existat traducere. */
export function ghidPeLimba<T extends IntrareGhid>(g: T, limba: Limba): T & { limba: Limba } {
  const en = limba === "en" ? TRADUCERI.ghid[g.id] : undefined;
  if (!en) return { ...g, limba: "ro" };
  return {
    ...g,
    pentru: en.pentru,
    ce: en.ce,
    salvezi: suma(g.salvezi, en.salvezi),
    pierzi: suma(g.pierzi, en.pierzi),
    pasi: en.pasi.length === g.pasi.length ? en.pasi : g.pasi,
    solutie: g.solutie && en.solutie ? { ...g.solutie, nume: en.solutie.nume, ce: en.solutie.ce } : g.solutie,
    nota: g.nota && en.nota ? en.nota : g.nota,
    limba: "en",
  };
}
