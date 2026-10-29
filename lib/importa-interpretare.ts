import { createHash } from "node:crypto";
import type { InterpretareAct } from "./interpretare";
import { verificaInterpretare, type RezultatVerificari } from "./verificari-interpretare";

/** Din antetul lotului: ce articole a primit modelul (dacă nu tot actul). */
export function articolePrimite(text: string): string[] | null {
  const m = text.match(/Textul primit conține doar articolele: (.+)$/m);
  return m ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : null;
}

export type CostInterpretare = { input: number; cache_write: number; cache_read: number; output: number; usd: number; secunde: number };

export type RandInterpretare = {
  act_id: string;
  model: string;
  driver: string;
  instructiuni_versiune: string;
  rezultat: InterpretareAct;
  verificari: RezultatVerificari;
  lot: { articole: string[] | null; text_hash: string; lungime: number; usage?: CostInterpretare };
  stare: "propus";
};

/** Verifică interpretarea față de textul primit de model și construiește rândul pentru `interpretari`. */
export function pregatesteRand(a: {
  actId: string;
  model: string;
  driver: string;
  versiune: string;
  interpretare: InterpretareAct;
  text: string;
  azi: string;
  usage?: CostInterpretare;
}): { verificari: RezultatVerificari; rand: RandInterpretare } {
  const verificari = verificaInterpretare(a.interpretare, a.text, { azi: a.azi });
  const lot: RandInterpretare["lot"] = {
    articole: articolePrimite(a.text),
    text_hash: createHash("sha256").update(a.text).digest("hex"),
    lungime: a.text.length,
    ...(a.usage ? { usage: a.usage } : {}),
  };
  const rand: RandInterpretare = {
    act_id: a.actId,
    model: a.model,
    driver: a.driver,
    instructiuni_versiune: a.versiune,
    rezultat: a.interpretare,
    verificari,
    lot,
    stare: "propus",
  };
  return { verificari, rand };
}

/** Liniile pe care le tipărește importul pentru o interpretare verificată (prima: rezumatul, apoi câte una pe verificare picată). */
export function liniiVerificare(cheie: string, interp: InterpretareAct, v: RezultatVerificari): string[] {
  const nr = interp.schimbari?.length ?? 0;
  const rezumat = v.ok
    ? `${nr} schimbări, verificări ok (${v.trecute.length})`
    : `${nr} schimbări, ${v.picate.length} verificări picate: ${v.picate.map((p) => p.cod + (p.schimbare !== undefined ? `#${p.schimbare}` : "")).join(", ")}`;
  return [`${v.ok ? "✓" : "!"} ${cheie}: ${interp.atinge_banii ? "atinge banii" : "nu atinge banii"}, ${rezumat}`, ...v.picate.map((p) => `    - ${p.mesaj}`)];
}

/** Cât din clientul Supabase folosim (db.mjs nu are tipuri). */
type ClientDb = { from(tabel: string): any };
type Verifica = (raspuns: any, eticheta: string) => any;
const verificaImplicit: Verifica = ({ data, error }, unde) => {
  if (error) throw new Error(`${unde}: ${error.message ?? String(error)}`);
  return data;
};

/**
 * Upsert în `interpretari` (cheia: act, model, driver, versiune) și, doar dacă actul încă așteaptă interpretarea
 * (candidat | triat_da | nou), trecerea lui în `interpretat`. `verifica` implicit aruncă la `error`; scripturile pasează `verifica` din scripts/legi/db.mjs (mesaj clar când tabelele lipsesc).
 */
export async function urcaInterpretare(sb: ClientDb, rand: RandInterpretare, actId: string, verifica: Verifica = verificaImplicit): Promise<void> {
  verifica(await sb.from("interpretari").upsert(rand, { onConflict: "act_id,model,driver,instructiuni_versiune" }), `interpretari (${actId})`);
  verifica(await sb.from("acte").update({ stare_procesare: "interpretat" }).eq("id", actId).in("stare_procesare", ["candidat", "triat_da", "nou"]), `acte (${actId})`);
}
