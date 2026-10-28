// Ce afișează un card din flux, calculat din Potrivire. Pur, testat; componenta doar randează.
import type { Potrivire } from "./potrivire";
import { actualizatLa } from "./catalog";
import { calculeaza } from "./formule";
import { FAMILII, TAGURI, etichetaTag } from "./taguri";
import type { Valori } from "./profil";

/** Sub atâtea zile termenul e roșu, cu eticheta „urgent” (ADR 0001). */
export const ZILE_URGENT = 30;

const LUNI = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];

export function dataScurta(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${LUNI[m - 1]} ${y}`;
}

/** „o zi”, „5 zile”, „154 de zile” (în română, de la 20 în sus se pune „de”). */
export function zile(n: number): string {
  if (n === 1) return "o zi";
  const r = n % 100;
  return `${n}${r === 0 || r >= 20 ? " de" : ""} zile`;
}

export function mii(n: number): string {
  return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** −120 / +25 / 0, cu minus tipografic. */
export function cuSemn(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "−" : r > 0 ? "+" : "") + mii(r);
}

export type StareCard = "proiect" | "adoptat" | "in_vigoare" | "termen_depasit";

export const ETICHETA_STARE: Record<StareCard, string> = {
  proiect: "proiect",
  adoptat: "adoptat",
  in_vigoare: "în vigoare",
  termen_depasit: "termen depășit",
};

export type VedereCard = {
  id: string;
  /** „Locuință · încălzire pe gaz”: familia primei etichete comune, apoi etichetele comune */
  kicker: string;
  titlu: string;
  stare: StareCard;
  act: string;
  /** lei/lună rotunjit; null = nu putem calcula */
  suma: number | null;
  /** ce să cerem omului când suma lipsește */
  cere: string | null;
  termen: { text: string; zile: number; urgent: boolean; depasit: boolean } | null;
  /** economia pe an dacă face acțiunea; null = nu o estimăm */
  economieAn: number | null;
};

const CERE: Partial<Record<keyof Valori, string>> = {
  pensie_lunara: "spune-ne pensia ta",
  dividende_anuale: "spune-ne dividendele tale",
  cheltuieli_lunare: "spune-ne cât cheltui pe lună",
  salariu_brut: "spune-ne salariul brut",
  salariu_net: "spune-ne salariul net",
};

export function vedere(p: Potrivire, valori: Valori): VedereCard {
  const s = p.schimbare;
  const a = s.actiuni.find((x) => x.termen) ?? s.actiuni[0];
  const zileT = p.zile_pana_la_termen;
  const depasit = zileT !== null && zileT < 0;
  const familie = FAMILII[TAGURI[p.taguri_comune[0]].familie];
  const eco = a?.formula_economie ? calculeaza(a.formula_economie, valori) : null;

  return {
    id: s.id,
    kicker: [familie, ...p.taguri_comune.map(etichetaTag)].join(" · "),
    titlu: s.rezumat,
    stare: depasit ? "termen_depasit" : s.status,
    act: s.act,
    suma: p.impact_lei_luna === null ? null : Math.round(p.impact_lei_luna),
    cere: p.impact_lei_luna === null ? (p.valori_lipsa.map((k) => CERE[k]).find(Boolean) ?? null) : null,
    termen:
      a?.termen && zileT !== null
        ? { text: dataScurta(a.termen), zile: zileT, urgent: !depasit && zileT < ZILE_URGENT, depasit }
        : null,
    economieAn: eco ? Math.round(eco * 12) : null,
  };
}

/** Ordinea din designul de referință (v3 F, „după impact”): suma cea mai mare în modul întâi. */
export function dupaImpact(a: Potrivire, b: Potrivire): number {
  return Math.abs(b.impact_lei_luna ?? 0) - Math.abs(a.impact_lei_luna ?? 0);
}

/** Sortarea fluxului: „după impact” (implicit, ADR 0001) sau „cele mai noi”. */
export type Sortare = "impact" | "noi";

export function sortareDin(x: string | undefined): Sortare {
  return x === "noi" ? "noi" : "impact";
}

/** Ordinea „cele mai noi”: forma la zi cea mai recentă întâi (publicare sau ultima modificare). */
export function dupaNoutate(a: Potrivire, b: Potrivire): number {
  return actualizatLa(b.schimbare).localeCompare(actualizatLa(a.schimbare));
}

/** Linkul one-click cu parametrii de tracking ceruți în issue #3. */
export function cuTracking(url: string, idSchimbare: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "ceinseamna");
  u.searchParams.set("utm_campaign", idSchimbare);
  return u.toString();
}
