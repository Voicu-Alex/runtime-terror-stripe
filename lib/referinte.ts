import referinteJson from "@/data/referinte.json";

/**
 * Valori de referință din alte acte (salariul minim brut etc.), cu perioade de valabilitate. O formulă de tip
 * `multiplu_referinta` le cere după id; modelul nu le scrie niciodată, deci nu intră în `numereDinLege`.
 * Ca data/destinatii.json: fiecare valoare are act, sursă, articol și data verificării de un om; ce nu e sursat rămâne TODO.
 */
export type ValoareReferinta = { de_la: string; valoare: number; act: string; sursa: string; articol: string; verificat_la: string };
export type Referinta = { eticheta: string; unitate: string; valori: ValoareReferinta[]; nota?: string };
export type ReferintaId = keyof typeof referinteJson;
export type Referinte = Record<string, Referinta>;

export const REFERINTE = referinteJson as Referinte;

export function esteReferinta(x: unknown): x is ReferintaId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(REFERINTE, x);
}

/** Valoarea în vigoare la `la` (ISO): intrarea cu cel mai mare `de_la` ≤ `la`. Null când nu există niciuna sursată. */
export function valoareReferinta(id: ReferintaId | string, la: string, referinte: Referinte = REFERINTE): number | null {
  const r = Object.prototype.hasOwnProperty.call(referinte, id) ? referinte[id] : undefined;
  if (!r) return null;
  let aleasa: ValoareReferinta | null = null;
  for (const v of r.valori) if (v.de_la <= la && (!aleasa || v.de_la > aleasa.de_la)) aleasa = v;
  return aleasa ? aleasa.valoare : null;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const dataBuna = (x: unknown) => typeof x === "string" && ISO.test(x) && !Number.isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0, 10) === x;

/** Problemele din fișierul de referințe (listă goală = ok). Rulează într-un test. */
export function valideazaReferinte(referinte: Referinte = REFERINTE): string[] {
  const probleme: string[] = [];
  for (const [id, r] of Object.entries(referinte)) {
    if (!r.eticheta?.trim()) probleme.push(`${id}: lipsește eticheta`);
    if (!r.unitate?.trim()) probleme.push(`${id}: lipsește unitatea`);
    if (!Array.isArray(r.valori) || r.valori.length === 0) probleme.push(`${id}: nicio valoare`);
    for (const [i, v] of (r.valori ?? []).entries()) {
      const unde = `${id}[${i}]`;
      if (typeof v.valoare !== "number" || !Number.isFinite(v.valoare)) probleme.push(`${unde}: valoarea nu e număr`);
      if (!dataBuna(v.de_la)) probleme.push(`${unde}: de_la nu e dată ISO`);
      if (!dataBuna(v.verificat_la)) probleme.push(`${unde}: verificat_la nu e dată ISO`);
      for (const k of ["act", "sursa", "articol"] as const) if (!v[k]?.trim()) probleme.push(`${unde}: lipsește ${k}`);
    }
  }
  return probleme;
}
