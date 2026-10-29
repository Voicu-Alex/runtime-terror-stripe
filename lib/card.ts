// Ce afișează un card din flux, calculat din Potrivire. Pur, testat; componenta doar randează.
import type { Potrivire } from "./potrivire";
import { actualizatLa } from "./catalog";
import { calculeazaEconomie, type Economie } from "./formule";
import { TAGURI } from "./taguri";
import { sursaAct } from "./traduceri";
import { etichetaTagL, familieL, lunaScurta, type Limba } from "./i18n";
import type { Valori } from "./profil";

/** Sub atâtea zile termenul e roșu, cu eticheta „urgent” (ADR 0001). */
export const ZILE_URGENT = 30;

export function dataScurta(iso: string, limba: Limba = "ro"): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${lunaScurta(limba, m - 1)} ${y}`;
}

/** „o zi”, „5 zile”, „154 de zile” (în română, de la 20 în sus se pune „de”). */
export function zile(n: number, limba: Limba = "ro"): string {
  if (limba === "en") return n === 1 ? "one day" : `${n} days`;
  if (n === 1) return "o zi";
  const r = n % 100;
  return `${n}${r === 0 || r >= 20 ? " de" : ""} zile`;
}

/** Separatorul de mii al limbii: 7.308 în română, 7,308 în engleză (altfel „7.308” se citește ca 7,3). */
export function mii(n: number, limba: Limba = "ro"): string {
  return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, limba === "en" ? "," : ".");
}

/** Păstrează și banii pentru economii punctuale (42,50 lei pe un plin; 42.50 în engleză). */
export function bani(n: number, limba: Limba = "ro"): string {
  return Math.abs(n).toLocaleString(limba === "en" ? "en-US" : "ro-RO", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
}

/** −120 / +25 / 0, cu minus tipografic. */
export function cuSemn(n: number, limba: Limba = "ro"): string {
  const r = Math.round(n);
  return (r < 0 ? "−" : r > 0 ? "+" : "") + mii(r, limba);
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
  /** impact anualizat în lei/an, rotunjit după conversie; null = nu putem calcula */
  suma: number | null;
  /** ce să cerem omului când suma lipsește */
  cere: string | null;
  termen: { text: string; zile: number; urgent: boolean; depasit: boolean } | null;
  /** economia cu perioada ei reală: anuală, în primul an sau punctuală */
  economie: Economie | null;
};

const CERE: Partial<Record<keyof Valori, string>> = {
  pensie_lunara: "indică cuantumul pensiei",
  dividende_anuale: "indică dividendele anuale",
  cheltuieli_lunare: "indică cheltuielile lunare",
  salariu_brut: "indică salariul brut",
  salariu_net: "indică salariul net",
  impozit_cladiri_anual: "indică impozitul pe clădire din decizia de impunere",
};

export function vedere(p: Potrivire, valori: Valori, limba: Limba = "ro"): VedereCard {
  const s = p.schimbare;
  const a = s.actiuni.find((x) => x.termen) ?? s.actiuni[0];
  const zileT = p.zile_pana_la_termen;
  const depasit = zileT !== null && zileT < 0;
  const familie = familieL(limba, TAGURI[p.taguri_comune[0]].familie);
  const eco = a?.formula_economie ? calculeazaEconomie(a.formula_economie, valori) : null;

  return {
    id: s.id,
    kicker: [familie, ...p.taguri_comune.map((t) => etichetaTagL(limba, t))].join(" · "),
    titlu: limba === "en" && s.rezumat_en ? s.rezumat_en : s.rezumat,
    stare: depasit ? "termen_depasit" : s.status,
    act: sursaAct(s, limba).act.text,
    suma: p.impact_lei_luna === null ? null : Math.round(p.impact_lei_luna * 12),
    cere: p.impact_lei_luna === null ? (p.valori_lipsa.map((k) => CERE[k]).find(Boolean) ?? null) : null,
    termen:
      a?.termen && zileT !== null
        ? { text: dataScurta(a.termen, limba), zile: zileT, urgent: !depasit && zileT < ZILE_URGENT, depasit }
        : null,
    economie: eco?.suma ? eco : null,
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
