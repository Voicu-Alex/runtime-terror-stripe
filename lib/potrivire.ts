import type { Conditie, Schimbare } from "./catalog";
import { calculeaza } from "./formule";
import type { Profil, Valori } from "./profil";
import type { TagId } from "./taguri";

/**
 * Potrivirea dintre profil și catalog. Rulează pe dispozitiv: profilul nu pleacă nicăieri.
 *
 * O schimbare atinge un om dacă:
 *  1. are măcar o etichetă comună cu profilul, și
 *  2. toate condițiile numerice sunt îndeplinite.
 * Dacă o condiție nu se poate evalua (lipsește valoarea), starea e „posibil”, nu „sigur”.
 */

export type Stare = "sigur" | "posibil";
export type Moment = "in_vigoare" | "urmeaza" | "expirat";

export type Potrivire = {
  schimbare: Schimbare;
  taguri_comune: TagId[];
  stare: Stare;
  /** lei pe lună; null = nu putem calcula din ce știm */
  impact_lei_luna: number | null;
  /** ce valori ar trebui să ne spună omul ca să calculăm sau să fim siguri */
  valori_lipsa: (keyof Valori)[];
  moment: Moment;
  /** zile până la termenul acțiunii (negativ = a trecut); null fără termen */
  zile_pana_la_termen: number | null;
};

type RezultatConditie = "adevarat" | "fals" | "necunoscut";

export function evalueazaConditia(c: Conditie, valori: Valori): RezultatConditie {
  const v = valori[c.camp];
  if (v == null) return "necunoscut";
  const ok =
    c.op === ">" ? v > c.valoare
    : c.op === ">=" ? v >= c.valoare
    : c.op === "<" ? v < c.valoare
    : c.op === "<=" ? v <= c.valoare
    : v === c.valoare;
  return ok ? "adevarat" : "fals";
}

export function momentul(s: Schimbare, azi: string): Moment {
  if (s.expira_la && s.expira_la < azi) return "expirat";
  if (s.in_vigoare_de_la > azi) return "urmeaza";
  return "in_vigoare";
}

function zileIntre(deLa: string, panaLa: string): number {
  const [a, b] = [deLa, panaLa].map((iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86_400_000);
}

/** Valorile de care are nevoie formula, ca să îi putem cere omului exact ce lipsește. */
const VALORI_FORMULEI: Partial<Record<NonNullable<Schimbare["formula"]>, (keyof Valori)[]>> = {
  tva_21: ["cheltuieli_lunare"],
  dividende_16: ["dividende_anuale"],
  cass_pensii: ["pensie_lunara"],
  it_scutire: ["salariu_brut"],
};

export function potriveste(profil: Profil, catalog: Schimbare[], azi = aziISO()): Potrivire[] {
  const rezultate: Potrivire[] = [];
  const profilTaguri = new Set<TagId>(profil.taguri);

  for (const s of catalog) {
    const comune = s.taguri.filter((t) => profilTaguri.has(t));
    if (comune.length === 0) continue;

    let stare: Stare = "sigur";
    const lipsa = new Set<keyof Valori>();
    let exclusa = false;
    for (const c of s.conditii) {
      const r = evalueazaConditia(c, profil.valori);
      if (r === "fals") {
        exclusa = true;
        break;
      }
      if (r === "necunoscut") {
        stare = "posibil";
        lipsa.add(c.camp);
      }
    }
    if (exclusa) continue;

    const impact = calculeaza(s.formula, profil.valori);
    if (impact == null && s.formula) for (const k of VALORI_FORMULEI[s.formula] ?? []) if (profil.valori[k] == null) lipsa.add(k);

    const termen = s.termen_actiune ?? s.actiuni.find((a) => a.termen)?.termen ?? null;

    rezultate.push({
      schimbare: s,
      taguri_comune: comune,
      stare,
      impact_lei_luna: impact,
      valori_lipsa: [...lipsa],
      moment: momentul(s, azi),
      zile_pana_la_termen: termen ? zileIntre(azi, termen) : null,
    });
  }

  return rezultate.sort((a, b) => a.schimbare.in_vigoare_de_la.localeCompare(b.schimbare.in_vigoare_de_la));
}

/** Suma pe lună a schimbărilor cu impact calculabil, fără și cu acțiunile bifate. */
export function planulMeu(potriviri: Potrivire[], actiuniBifate: Set<string>, valori: Valori) {
  let faraActiuni = 0;
  let economii = 0;
  for (const p of potriviri) {
    faraActiuni += p.impact_lei_luna ?? 0;
    if (!actiuniBifate.has(p.schimbare.id)) continue;
    for (const a of p.schimbare.actiuni) economii += calculeaza(a.formula_economie, valori) ?? 0;
  }
  return { fara_actiuni: round2(faraActiuni), cu_actiuni: round2(faraActiuni + economii), economii: round2(economii) };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function aziISO(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
