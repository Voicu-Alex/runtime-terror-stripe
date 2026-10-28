import { esteTag, type TagId } from "./taguri";

/**
 * Valorile numerice opționale din profil. Lipsesc până le dă omul; o formulă care
 * are nevoie de o valoare lipsă întoarce null, iar potrivirea devine „posibil”.
 * Toate sunt în lei; cele „_lunara” pe lună, cele „_anuale” pe an.
 */
export type Valori = {
  salariu_net?: number;
  salariu_brut?: number;
  pensie_lunara?: number;
  dividende_anuale?: number;
  cheltuieli_lunare?: number;
};

export type CampValoare = keyof Valori;

export const CAMPURI_VALORI: Record<CampValoare, string> = {
  salariu_net: "salariul net pe lună",
  salariu_brut: "salariul brut pe lună",
  pensie_lunara: "pensia pe lună",
  dividende_anuale: "dividendele pe an",
  cheltuieli_lunare: "cheltuielile pe lună",
};

export type Profil = {
  taguri: TagId[];
  valori: Valori;
};

export const PROFIL_GOL: Profil = { taguri: [], valori: {} };

const CHEIE = "cipm.profil.v1";

/** Adaugă etichete și valori peste un profil existent, fără dubluri. Funcție pură. */
export function adaugaInProfil(profil: Profil, taguri: TagId[], valori: Valori = {}): Profil {
  const set = new Set<TagId>([...profil.taguri, ...taguri]);
  const valoriCurate: Valori = { ...profil.valori };
  for (const [k, v] of Object.entries(valori) as [CampValoare, number | undefined][]) {
    if (typeof v === "number" && Number.isFinite(v)) valoriCurate[k] = v;
  }
  return { taguri: [...set], valori: valoriCurate };
}

export function scoateDinProfil(profil: Profil, tag: TagId): Profil {
  return { ...profil, taguri: profil.taguri.filter((t) => t !== tag) };
}

/** Profilul stă doar pe dispozitiv (localStorage). Orice eroare de storage dă profilul gol. */
export function incarcaProfil(): Profil {
  if (typeof window === "undefined") return PROFIL_GOL;
  try {
    const brut = window.localStorage.getItem(CHEIE);
    if (!brut) return PROFIL_GOL;
    return normalizeaza(JSON.parse(brut));
  } catch {
    return PROFIL_GOL;
  }
}

export function salveazaProfil(profil: Profil): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHEIE, JSON.stringify(normalizeaza(profil)));
  } catch {
    // storage blocat (private mode etc.): profilul rămâne doar în memorie
  }
}

export function stergeProfil(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHEIE);
  } catch {
    // nimic de făcut
  }
}

/** Păstrează doar etichetele din taxonomie și valorile numerice valide. */
export function normalizeaza(x: unknown): Profil {
  if (!x || typeof x !== "object") return PROFIL_GOL;
  const o = x as { taguri?: unknown; valori?: unknown };
  const taguri = Array.isArray(o.taguri) ? o.taguri.filter(esteTag) : [];
  const valori: Valori = {};
  if (o.valori && typeof o.valori === "object") {
    for (const k of Object.keys(CAMPURI_VALORI) as CampValoare[]) {
      const v = (o.valori as Record<string, unknown>)[k];
      if (typeof v === "number" && Number.isFinite(v)) valori[k] = v;
    }
  }
  return { taguri: [...new Set(taguri)], valori };
}
