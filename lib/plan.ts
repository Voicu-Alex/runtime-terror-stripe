// Planul meu și notificarea: ce acțiuni a bifat omul și care act merită primul ecran. Pur, testat.
import { calculeaza } from "./formule";
import type { Potrivire } from "./potrivire";
import type { Valori } from "./profil";

const CHEIE = "cipm.plan.v1";

/** Id-urile schimbărilor ale căror acțiuni le-a bifat omul. Doar pe dispozitiv. */
export function incarcaPlan(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const brut = window.localStorage.getItem(CHEIE);
    const lista: unknown = brut ? JSON.parse(brut) : [];
    return new Set(Array.isArray(lista) ? lista.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function salveazaPlan(bifate: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHEIE, JSON.stringify([...bifate]));
  } catch {
    // storage blocat: planul rămâne în memorie
  }
}

/**
 * Actul care deschide aplicația (notificarea). Întâi ce are termen în viitor și se apropie
 * (cel mai aproape primul), apoi ce mișcă cei mai mulți bani pe lună: impactul în modul
 * sau economia din acțiune (prima de stabilitate are impact 0, dar 1.000 lei/lună din acțiune).
 * Fără potriviri: null.
 */
export function alegeNotificarea(potriviri: Potrivire[], valori: Valori = {}): Potrivire | null {
  if (potriviri.length === 0) return null;
  const cuTermen = potriviri.filter((p) => p.zile_pana_la_termen !== null && p.zile_pana_la_termen >= 0);
  if (cuTermen.length > 0) return cuTermen.sort((a, b) => a.zile_pana_la_termen! - b.zile_pana_la_termen!)[0];
  const bani = (p: Potrivire) =>
    Math.max(Math.abs(p.impact_lei_luna ?? 0), ...p.schimbare.actiuni.map((a) => calculeaza(a.formula_economie, valori) ?? 0));
  return [...potriviri].sort((a, b) => bani(b) - bani(a))[0];
}
