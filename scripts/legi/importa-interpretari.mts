#!/usr/bin/env node
/**
 * Poarta dintre model și om: citește răspunsurile modelului dintr-un lot, rulează verificările automate față de textul
 * pe care l-a primit modelul și urcă propunerile în `interpretari` (stare `propus`), marcând actul `interpretat`.
 *
 *   node --env-file=.env.local --import tsx scripts/legi/importa-interpretari.mts --dir scratch/lot --model claude-sonnet-5-5 --driver subagent
 *   ... --dry-run          doar verificările, nimic în Supabase
 *   ... --raspunsuri <dir> răspunsurile stau în alt director decât textele (ex. scratch/lot-api pentru API)
 *
 * Lotul: <dir>/<id>.txt (textul primit de model, cu antetul din export-lot) și <id>.json (obiectul întors de model).
 * Un răspuns cu verificări picate se urcă totuși (ca omul să vadă de ce), dar pagina /admin/acte nu lasă aprobarea.
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import type { InterpretareAct } from "../../lib/interpretare.ts";
import { verificaInterpretare } from "../../lib/verificari-interpretare.ts";
import { clientSupabase, verifica } from "./db.mjs";

const { values: arg } = parseArgs({
  options: {
    dir: { type: "string", default: "scratch/lot" },
    raspunsuri: { type: "string" },
    model: { type: "string" },
    driver: { type: "string" },
    versiune: { type: "string", default: "v3" },
    "dry-run": { type: "boolean", default: false },
  },
});
if (!arg.model || !["subagent", "api"].includes(arg.driver ?? "")) {
  console.error("Dă --model <nume> și --driver subagent|api.");
  process.exit(1);
}
const dirTexte = arg.dir!;
const dirRaspunsuri = arg.raspunsuri ?? dirTexte;
const azi = new Date().toISOString().slice(0, 10);
const sb = arg["dry-run"] ? null : clientSupabase({ scriere: true });

/** Din antetul lotului: ce articole a primit modelul (dacă nu tot actul). */
function articolePrimite(text: string): string[] | null {
  const m = text.match(/Textul primit conține doar articolele: (.+)$/m);
  return m ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : null;
}

const fisiere = (await readdir(dirRaspunsuri)).filter((f) => f.endsWith(".json") && f !== "manifest.json");
if (!fisiere.length) {
  console.error(`Niciun răspuns .json în ${dirRaspunsuri}.`);
  process.exit(1);
}
let urcate = 0;
let picate = 0;
for (const f of fisiere.sort()) {
  const cheie = f.replace(/\.json$/, "");
  const actId = cheie.replace(/^portal[-_]/, "portal:");
  let interp: InterpretareAct;
  try {
    interp = JSON.parse(await readFile(path.join(dirRaspunsuri, f), "utf8"));
  } catch (e) {
    console.log(`✗ ${cheie}: JSON invalid (${e instanceof Error ? e.message : String(e)})`);
    continue;
  }
  let text: string;
  try {
    text = await readFile(path.join(dirTexte, `${cheie}.txt`), "utf8");
  } catch {
    console.log(`✗ ${cheie}: lipsește textul ${cheie}.txt din ${dirTexte}`);
    continue;
  }
  const v = verificaInterpretare(interp, text, { azi });
  const nr = interp.schimbari?.length ?? 0;
  const rezumat = v.ok ? `${nr} schimbări, verificări ok (${v.trecute.length})` : `${nr} schimbări, ${v.picate.length} verificări picate: ${v.picate.map((p) => p.cod + (p.schimbare !== undefined ? `#${p.schimbare}` : "")).join(", ")}`;
  console.log(`${v.ok ? "✓" : "!"} ${cheie}: ${interp.atinge_banii ? "atinge banii" : "nu atinge banii"}, ${rezumat}`);
  if (!v.ok) {
    picate++;
    for (const p of v.picate) console.log(`    - ${p.mesaj}`);
  }
  if (!sb) continue;

  const lot = { articole: articolePrimite(text), text_hash: createHash("sha256").update(text).digest("hex"), lungime: text.length };
  const rand = { act_id: actId, model: arg.model, driver: arg.driver, instructiuni_versiune: arg.versiune, rezultat: interp, verificari: v, lot, stare: "propus" };
  verifica(await sb.from("interpretari").upsert(rand, { onConflict: "act_id,model,driver,instructiuni_versiune" }), `interpretari (${actId})`);
  verifica(await sb.from("acte").update({ stare_procesare: "interpretat" }).eq("id", actId).in("stare_procesare", ["candidat", "triat_da", "nou"]), `acte (${actId})`);
  urcate++;
}
console.log(`\n${fisiere.length} răspunsuri, ${picate} cu verificări picate${sb ? `, ${urcate} urcate în interpretari (propus)` : " (dry-run, nimic urcat)"}`);
