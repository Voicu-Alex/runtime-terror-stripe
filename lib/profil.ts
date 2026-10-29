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
  /** venitul net lunar împărțit la membrii familiei; pragurile pentru beneficii sociale se dau așa */
  venit_net_pe_membru?: number;
  /** din el se calculează vârsta la data potrivirii; nu cerem data completă a nașterii */
  an_nastere?: number;
  nr_copii?: number;
  /** vârsta celui mai mic copil, în ani; multe drepturi se opresc la 2, la 18 sau la 26 */
  varsta_copil_mic?: number;
  persoane_intretinere?: number;
  /** impozitul pe clădiri plătit pe an, de pe decizia de impunere; îl cer scutirile (formula „scutire”) */
  impozit_cladiri_anual?: number;
  /** valoarea impozabilă a locuinței de pe decizia de impunere; baza impozitului pe clădiri */
  valoare_impozabila_locuinta?: number;
  /** prețul de achiziție al mașinii */
  pret_masina?: number;
  /** cifra de afaceri a PFA sau a SRL-ului pe an; pragurile de la micro și TVA se dau pe ea */
  cifra_afaceri_anuala?: number;
  /** câștigul din investiții (acțiuni, titluri, cripto) realizat într-un an */
  castig_investitii_anual?: number;
  /** chiria încasată pe lună de cine închiriază o locuință altora */
  chirie_incasata_lunara?: number;
  /** consumul de gaz pe an, în kWh, de pe facturi */
  consum_gaz_anual_kwh?: number;
  /** impozitul pe venit plătit pentru anul precedent, din decizia de impunere */
  impozit_venit_anual_precedent?: number;
};

export type CampValoare = keyof Valori;

/** Câmpurile pe care le poate folosi o condiție: valorile din profil plus cele derivate la potrivire. */
export type CampConditie = CampValoare | "varsta";

export const CAMPURI_VALORI: Record<CampValoare, { eticheta: string; unitate: string }> = {
  salariu_net: { eticheta: "salariul net pe lună", unitate: "lei" },
  salariu_brut: { eticheta: "salariul brut pe lună", unitate: "lei" },
  pensie_lunara: { eticheta: "pensia pe lună", unitate: "lei" },
  dividende_anuale: { eticheta: "dividendele pe an", unitate: "lei" },
  cheltuieli_lunare: { eticheta: "cheltuielile pe lună", unitate: "lei" },
  venit_net_pe_membru: { eticheta: "venitul net pe membru de familie", unitate: "lei" },
  an_nastere: { eticheta: "anul nașterii", unitate: "" },
  nr_copii: { eticheta: "numărul copiilor", unitate: "" },
  varsta_copil_mic: { eticheta: "vârsta celui mai mic copil", unitate: "ani" },
  persoane_intretinere: { eticheta: "persoane în întreținere", unitate: "" },
  impozit_cladiri_anual: { eticheta: "impozitul pe clădiri pe an", unitate: "lei" },
  valoare_impozabila_locuinta: { eticheta: "valoarea impozabilă a locuinței", unitate: "lei" },
  pret_masina: { eticheta: "prețul de achiziție al mașinii", unitate: "lei" },
  cifra_afaceri_anuala: { eticheta: "cifra de afaceri pe an", unitate: "lei" },
  castig_investitii_anual: { eticheta: "câștigul din investiții pe an", unitate: "lei" },
  chirie_incasata_lunara: { eticheta: "chiria încasată pe lună", unitate: "lei" },
  consum_gaz_anual_kwh: { eticheta: "consumul de gaz pe an", unitate: "kWh" },
  impozit_venit_anual_precedent: { eticheta: "impozitul pe venit plătit anul trecut", unitate: "lei" },
};

/** Vârsta la o dată, din anul nașterii. Aproximație la nivel de an, suficientă pentru praguri. */
export function varstaLa(anNastere: number | undefined, aziISO: string): number | undefined {
  if (anNastere == null) return undefined;
  return Number(aziISO.slice(0, 4)) - anNastere;
}

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
