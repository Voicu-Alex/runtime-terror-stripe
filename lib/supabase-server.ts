import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Clientul Supabase cu cheia secretă. Doar pe server: cheia nu ajunge niciodată în browser. */
export function supabaseServer() {
  // ca scripts/supabase-client.mjs și scripts/legi/db.mjs: merge și SUPABASE_URL
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const cheie = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cheie) throw new Error("Lipsesc NEXT_PUBLIC_SUPABASE_URL (sau SUPABASE_URL) și SUPABASE_SECRET_KEY (sau SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(url, cheie, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type ActiunePropusa = {
  tip: string;
  cine_aplica: string;
  text: string;
  termen: string | null;
  destinatie: string | null;
  destinatie_propusa?: string | null;
};

export type SchimbarePropusa = {
  rezumat: string;
  rezumat_en?: string | null;
  taguri: string[];
  in_vigoare_de_la: string | null;
  pana_la: string | null;
  status: string;
  directie: string;
  formula: string | null;
  formula_tip: unknown;
  articol: string;
  citat: string;
  niveluri: { zero: string; curios: string; expert: string };
  actiuni: ActiunePropusa[];
  incredere: string;
  nota: string | null;
};

export type RezultatInterpretare = {
  act: string;
  mo: string;
  publicat_la: string;
  atinge_banii: boolean;
  schimbari: SchimbarePropusa[];
};

export type Verificare = { cod: string; mesaj: string; schimbare?: number };
export type Verificari = {
  trecute: Verificare[];
  picate: Verificare[];
  /** lipsesc la interpretările vechi, dinainte de v4 */
  avertismente?: Verificare[];
  calculabile?: { cu_formula: number; active_cu_bani: number };
  ok: boolean;
};

export type ActInterpretare = {
  titlu: string;
  mo_ref: string | null;
  url: string;
  publicat_la: string | null;
  tip_act: string | null;
  numar: string | null;
  an: number | null;
  lungime: number | null;
};

export type RandInterpretare = {
  id: number;
  model: string;
  driver: string;
  creat_la: string;
  rezultat: RezultatInterpretare;
  verificari: Verificari | null;
  act: ActInterpretare;
};

export type Interpretari = { randuri: RandInterpretare[]; tabeleLipsa: boolean; eroare: string | null };

/** Interpretările în starea „propus”, cu actul lor. Dacă tabelele nu există încă, `tabeleLipsa` e true. */
export async function interpretariPropuse(): Promise<Interpretari> {
  const { data, error } = await supabaseServer()
    .from("interpretari")
    .select("id, model, driver, creat_la, rezultat, verificari, acte(titlu, mo_ref, url, publicat_la, tip_act, numar, an, lungime)")
    .eq("stare", "propus")
    .order("creat_la", { ascending: true });
  if (error) {
    const lipsa = error.code === "PGRST205" || error.code === "42P01" || /does not exist|schema cache/i.test(error.message);
    return { randuri: [], tabeleLipsa: lipsa, eroare: lipsa ? null : error.message };
  }
  const randuri = (data ?? []).flatMap((r) => {
    const act = Array.isArray(r.acte) ? r.acte[0] : r.acte;
    return act ? [{ ...r, act } as unknown as RandInterpretare] : [];
  });
  return { randuri, tabeleLipsa: false, eroare: null };
}
