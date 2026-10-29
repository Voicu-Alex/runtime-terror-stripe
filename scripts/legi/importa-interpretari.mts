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
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import type { InterpretareAct } from "../../lib/interpretare.ts";
import { liniiVerificare, pregatesteRand, textCalculabile, urcaInterpretare } from "../../lib/importa-interpretare.ts";
import { clientSupabase, verifica } from "./db.mjs";

const { values: arg } = parseArgs({
  options: {
    dir: { type: "string", default: "scratch/lot" },
    raspunsuri: { type: "string" },
    model: { type: "string" },
    driver: { type: "string" },
    versiune: { type: "string", default: "v4" },
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

const fisiere = (await readdir(dirRaspunsuri)).filter((f) => f.endsWith(".json") && f !== "manifest.json");
if (!fisiere.length) {
  console.error(`Niciun răspuns .json în ${dirRaspunsuri}.`);
  process.exit(1);
}
let urcate = 0;
let picate = 0;
const calc = { cu_formula: 0, active_cu_bani: 0 };
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
  const { verificari: v, rand } = pregatesteRand({ actId, model: arg.model!, driver: arg.driver!, versiune: arg.versiune!, interpretare: interp, text, azi });
  for (const linie of liniiVerificare(cheie, interp, v)) console.log(linie);
  if (!v.ok) picate++;
  calc.cu_formula += v.calculabile.cu_formula;
  calc.active_cu_bani += v.calculabile.active_cu_bani;
  if (!sb) continue;

  const rez = await urcaInterpretare(sb, rand, actId, verifica);
  if (rez.urcat) urcate++;
  else console.log(`  ${actId}: sărit, ${rez.motiv}`);
}
console.log(`\n${fisiere.length} răspunsuri, ${picate} cu verificări picate, ${textCalculabile(calc)}${sb ? `, ${urcate} urcate în interpretari (propus)` : " (dry-run, nimic urcat)"}`);
