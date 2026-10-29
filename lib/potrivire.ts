import type { Conditie, Schimbare } from "./catalog";
import { calculeaza, calculeazaEconomie } from "./formule";
import { evalueazaTip, necesita } from "./formule-tip";
import { varstaLa, type CampConditie, type Profil, type Valori } from "./profil";
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
  valori_lipsa: CampValoare[];
  moment: Moment;
  /** zile până la termenul acțiunii (negativ = a trecut); null fără termen */
  zile_pana_la_termen: number | null;
};

type RezultatConditie = "adevarat" | "fals" | "necunoscut";
type CampValoare = keyof Valori;

/** Valorile din profil plus cele derivate (vârsta), pe care le pot folosi condițiile. */
export type ValoriConditii = Valori & { varsta?: number };

export function valoriPentruConditii(valori: Valori, azi: string): ValoriConditii {
  return { ...valori, varsta: varstaLa(valori.an_nastere, azi) };
}

/** Ce valoare din profil trebuie cerută ca să se poată evalua un câmp de condiție. */
function campDeCerut(camp: CampConditie): CampValoare {
  return camp === "varsta" ? "an_nastere" : camp;
}

export function evalueazaConditia(c: Conditie, valori: ValoriConditii): RezultatConditie {
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
const VALORI_FORMULEI: Partial<Record<NonNullable<Schimbare["formula"]>, CampValoare[]>> = {
  tva_21: ["cheltuieli_lunare"],
  dividende_16: ["dividende_anuale"],
  cass_pensii: ["pensie_lunara"],
  it_scutire: ["salariu_brut"],
  alocatie_copii: ["nr_copii"],
};

export function potriveste(profil: Profil, catalog: Schimbare[], azi = aziISO()): Potrivire[] {
  const rezultate: Potrivire[] = [];
  const profilTaguri = new Set<TagId>(profil.taguri);
  const valori = valoriPentruConditii(profil.valori, azi);
  const inlocuite = inlocuiteLa(catalog, azi);

  for (const s of catalog) {
    // Legea cea mai nouă câștigă: un act înlocuit de altul deja publicat nu mai apare.
    if (inlocuite.has(s.id)) continue;
    const comune = s.taguri.filter((t) => profilTaguri.has(t));
    if (comune.length === 0) continue;

    let stare: Stare = "sigur";
    const lipsa = new Set<CampValoare>();
    let exclusa = false;
    for (const c of s.conditii) {
      const r = evalueazaConditia(c, valori);
      if (r === "fals") {
        exclusa = true;
        break;
      }
      if (r === "necunoscut") {
        stare = "posibil";
        lipsa.add(campDeCerut(c.camp));
      }
    }
    if (exclusa) continue;

    // formula scrisă de mână are prioritate; altfel formula parametrizată (lib/formule-tip.ts)
    const impact = s.formula
      ? calculeaza(s.formula, profil.valori)
      : s.formula_tip
        ? evalueazaTip(s.formula_tip, profil.valori, s.directie, { la: azi })
        : null;
    if (impact == null && s.formula) for (const k of VALORI_FORMULEI[s.formula] ?? []) if (profil.valori[k] == null) lipsa.add(k);
    if (impact == null && !s.formula && s.formula_tip) for (const k of necesita(s.formula_tip)) if (profil.valori[k] == null) lipsa.add(k);

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

/** Id-urile înlocuite de un act publicat până la data dată (un proiect nepublicat nu înlocuiește nimic). */
export function inlocuiteLa(catalog: Schimbare[], azi: string): Set<string> {
  const set = new Set<string>();
  for (const s of catalog) if (s.publicat_la <= azi) for (const id of s.inlocuieste ?? []) set.add(id);
  return set;
}

/** Impactul recurent rămâne lunar în motor; economiile punctuale se întorc separat, integral. */
export function planulMeu(potriviri: Potrivire[], actiuniBifate: Set<string>, valori: Valori, azi = aziISO()) {
  let faraActiuni = 0;
  let economii = 0;
  let punctuale = 0;
  let primulAn = false;
  for (const p of potriviri) {
    faraActiuni += p.impact_lei_luna ?? 0;
    if (!actiuniBifate.has(p.schimbare.id)) continue;
    for (const a of p.schimbare.actiuni) {
      if (a.termen && a.termen < azi) continue;
      const economie = calculeazaEconomie(a.formula_economie, valori);
      if (!economie) continue;
      if (economie.unitate === "lei în primul an") primulAn = true;
      if (economie.punctuala) punctuale += economie.suma;
      else economii += economie.suma / 12;
    }
  }
  return { fara_actiuni: round2(faraActiuni), cu_actiuni: round2(faraActiuni + economii), economii: round2(economii), economii_punctuale: round2(punctuale), unitate: primulAn ? "lei în primul an" : "lei/an" };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function aziISO(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
