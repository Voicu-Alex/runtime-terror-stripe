// Freemium (ADR 0003, 0004): o deblocare gratuită de la început și încă una pentru profilul completat;
// Pro deschide tot. Ce ai deblocat rămâne deblocat. Totul stă pe dispozitiv, ca profilul. Pur, testat.

const CHEIE = "cipm.freemium.v1";

export type StareFreemium = {
  /** id-urile actelor deblocate cu o deblocare gratuită, în ordinea deblocării */
  deblocate: string[];
};

export const FREEMIUM_GOL: StareFreemium = { deblocate: [] };

/** Câte deblocări gratuite ai în total: una inițială, plus recompensa unică pentru profilul completat. */
export function deblocariTotale(profilCompletat: boolean): number {
  return profilCompletat ? 2 : 1;
}

export function deblocariRamase(s: StareFreemium, profilCompletat: boolean): number {
  return Math.max(0, deblocariTotale(profilCompletat) - s.deblocate.length);
}

export function areAcces(s: StareFreemium, id: string, pro: boolean): boolean {
  return pro || s.deblocate.includes(id);
}

/** Folosește o deblocare pe act. Fără deblocări rămase sau dacă e deja deblocat, starea nu se schimbă. */
export function deblocheaza(s: StareFreemium, id: string, profilCompletat: boolean): StareFreemium {
  if (s.deblocate.includes(id) || deblocariRamase(s, profilCompletat) === 0) return s;
  return { deblocate: [...s.deblocate, id] };
}

export function incarcaFreemium(): StareFreemium {
  if (typeof window === "undefined") return FREEMIUM_GOL;
  try {
    const brut = window.localStorage.getItem(CHEIE);
    const x: unknown = brut ? JSON.parse(brut) : null;
    const lista = x && typeof x === "object" && Array.isArray((x as StareFreemium).deblocate) ? (x as StareFreemium).deblocate : [];
    return { deblocate: lista.filter((id): id is string => typeof id === "string") };
  } catch {
    return FREEMIUM_GOL;
  }
}

export function salveazaFreemium(s: StareFreemium): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHEIE, JSON.stringify(s));
  } catch {
    // storage blocat: deblocarea ține până la reîncărcare
  }
}
