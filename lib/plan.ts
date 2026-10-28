// Planul meu și notificarea: ce acțiuni a bifat omul și care act merită primul ecran. Pur, testat.
import type { Potrivire } from "./potrivire";

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
 * (cel mai aproape primul), apoi ce are impactul cel mai mare în modul. Fără potriviri: null.
 */
export function alegeNotificarea(potriviri: Potrivire[]): Potrivire | null {
  if (potriviri.length === 0) return null;
  const cuTermen = potriviri.filter((p) => p.zile_pana_la_termen !== null && p.zile_pana_la_termen >= 0);
  if (cuTermen.length > 0) return cuTermen.sort((a, b) => a.zile_pana_la_termen! - b.zile_pana_la_termen!)[0];
  return [...potriviri].sort((a, b) => Math.abs(b.impact_lei_luna ?? 0) - Math.abs(a.impact_lei_luna ?? 0))[0];
}
