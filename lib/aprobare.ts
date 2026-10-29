/**
 * Aprobarea sau respingerea unei interpretări propuse (tabelul `interpretari`).
 * Contractul e folosit de pagina /admin/acte (acțiuni de server) și de scripts/legi/aproba.mts.
 * Implementarea vine din lib/interpretare.ts (maparea spre Schimbare + IntrareGhid) și scrie
 * data/catalog.json, data/ghid.json și rândurile din Supabase.
 *
 * STUB: înlocuit de builderul mapării. Semnăturile rămân.
 */

export type OptiuniAprobare = {
  /** indecșii schimbărilor din `rezultat.schimbari` de aprobat; lipsă = toate */
  schimbari?: number[];
  /** adresa celui care aprobă, scrisă în nota_revizor */
  revizor: string;
  /** data verificării (ISO); lipsă = azi */
  azi?: string;
};

export type RezultatAprobare = { schimbareIds: string[] };

export async function aprobaInterpretare(_id: number, _optiuni: OptiuniAprobare): Promise<RezultatAprobare> {
  throw new Error("aprobaInterpretare: neimplementat încă (stub)");
}

export async function respingeInterpretare(_id: number, _optiuni: { nota: string; revizor: string }): Promise<void> {
  throw new Error("respingeInterpretare: neimplementat încă (stub)");
}
