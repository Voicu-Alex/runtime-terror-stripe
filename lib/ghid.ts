import ghidJson from "@/data/ghid.json";
import { CATALOG, type Schimbare } from "./catalog";

/**
 * Pagina „Toate schimbările” (/legi): fiecare act din catalog, netargetat, cu un caz de referință
 * scris în ipoteză („la un apartament de 400.000 lei”). Textele stau în data/ghid.json; actul, MO-ul,
 * articolul și linkul vin din catalog. Ordinea: întâi ce poți salva cel mai mult.
 */

export type Suma = {
  lei: number;
  /** o_data = o singură dată; pe_an = în fiecare an */
  cand: "o_data" | "pe_an";
  /** Etichetă mai precisă pentru un plin, primul an sau o perioadă limitată. */
  perioada?: string;
  /** cazul de referință pentru care e calculată suma */
  ipoteza: string;
};

export type Solutie = { nume: string; url: string | null; ce: string };

export type IntrareGhid = {
  id: string;
  /** „Pentru proprietarii de case și apartamente” */
  pentru: string;
  /** ce se schimbă, spus scurt: „impozitul pe clădire crește din 2026” */
  ce: string;
  /** cât poți păstra dacă faci pașii; null = nu avem o sumă cu sursă */
  salvezi: Suma | null;
  /** cât pierzi dacă nu faci nimic; null = nu avem o sumă cu sursă */
  pierzi: Suma | null;
  /** până când merită făcuți pașii (ISO); null = oricând */
  termen: string | null;
  pasi: string[];
  /** unde se face pasul care salvează cei mai mulți bani: un instrument oficial, nu un produs */
  solutie: Solutie | null;
  nota?: string;
};

export type ArticolGhid = IntrareGhid & {
  schimbare: Schimbare;
  /** termenul a trecut față de azi */
  expirat: boolean;
  /** zile până la termen (negativ = trecut); null fără termen */
  zile: number | null;
};

export class GhidInvalid extends Error {}

/** Fiecare intrare trebuie să trimită la un act din catalog, o singură dată. */
export function valideazaGhid(brut: unknown, catalog: Schimbare[]): IntrareGhid[] {
  if (!Array.isArray(brut)) throw new GhidInvalid("ghidul trebuie să fie o listă");
  const ids = new Set(catalog.map((s) => s.id));
  const vazute = new Set<string>();
  return brut.map((x: IntrareGhid) => {
    if (!ids.has(x.id)) throw new GhidInvalid(`„${x.id}” nu e în catalog`);
    if (vazute.has(x.id)) throw new GhidInvalid(`„${x.id}” apare de două ori`);
    vazute.add(x.id);
    if (!x.pentru || !x.ce || !x.pasi?.length) throw new GhidInvalid(`„${x.id}”: lipsește pentru, ce sau pașii`);
    return x;
  });
}

export const GHID: IntrareGhid[] = valideazaGhid(ghidJson, CATALOG);

/** Suma pusă pe aceeași scară, ca să se poată compara: cât înseamnă în următoarele 12 luni. */
export function pe12Luni(s: Suma | null): number {
  return s ? s.lei : 0;
}

function zileIntre(deLa: string, panaLa: string): number {
  const ms = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((ms(panaLa) - ms(deLa)) / 86_400_000);
}

/**
 * Actele cu pași încă posibili, de la cel care poate salva cei mai mulți bani în jos; la egalitate
 * (sau fără sumă), cel care costă mai mult dacă nu faci nimic. Cele cu termenul trecut, separat, la final.
 */
export function ordoneaza(ghid: IntrareGhid[], catalog: Schimbare[], azi: string): { active: ArticolGhid[]; expirate: ArticolGhid[] } {
  const dupaId = new Map(catalog.map((s) => [s.id, s]));
  const toate: ArticolGhid[] = ghid.map((g) => {
    const zile = g.termen ? zileIntre(azi, g.termen) : null;
    return { ...g, schimbare: dupaId.get(g.id)!, zile, expirat: zile !== null && zile < 0 };
  });
  const ordine = (a: ArticolGhid, b: ArticolGhid) =>
    pe12Luni(b.salvezi) - pe12Luni(a.salvezi) || pe12Luni(b.pierzi) - pe12Luni(a.pierzi);
  return {
    active: toate.filter((x) => !x.expirat).sort(ordine),
    expirate: toate.filter((x) => x.expirat).sort(ordine),
  };
}
