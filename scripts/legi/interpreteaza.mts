#!/usr/bin/env node
/**
 * Interpretarea actelor prin API-ul Claude: ia actele care așteaptă, trimite modelului textul (lib/lot.ts), rulează
 * verificările automate (lib/verificari-interpretare.ts) și urcă propunerile în `interpretari` (stare `propus`, driver `api`).
 * Omul aprobă apoi în /admin/acte; aici nu există niciun pas manual și nimic nu intră în catalog.
 *
 * Cu Supabase:
 *   npm run legi:interpreteaza -- --stare triat_da --max 10 --buget-usd 2
 *   npm run legi:interpreteaza -- --ids portal:293109,portal:305208 --model claude-haiku-5-5
 *   ... --versiune v3        versiunea instrucțiunilor (cheia de conflict a upsert-ului, ca la legi:importa)
 *   ... --dry-run            apelează modelul și afișează verificările, dar nu scrie nimic în Supabase
 *
 * Fără Supabase (loturile din legi:export-lot, <id>.txt):
 *   npm run legi:interpreteaza -- --din scratch/lot --out scratch/lot-api [--ids portal_293109]
 *   scrie <out>/<id>.json (la eșec <id>.raw.txt) și <out>/cost.json
 *
 * Opțiuni comune: --model (implicit LEGI_MODEL_INTERPRETARE sau claude-sonnet-5-5), --buget-usd (implicit 2).
 * Un act la care apelul eșuează rămâne neatins în Supabase, deci îl reia rularea următoare; răspunsul brut se salvează
 * în scratch/interpretare-erori/<id>.raw.txt. Ieșire: 0 normal, 1 eroare fatală (cheie lipsă, Supabase), 2 oprit de buget.
 * Modelul propune; poarta rămâne verificaInterpretare.
 */
import Anthropic from "@anthropic-ai/sdk";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { liniiVerificare, pregatesteRand, urcaInterpretare } from "../../lib/importa-interpretare.ts";
import { interpreteazaText, construiesteSistem, PRETURI } from "../../lib/interpretare-api.ts";
import { textPentruModel } from "../../lib/lot.ts";
import { clientSupabase, verifica } from "./db.mjs";

const RAD = path.join(import.meta.dirname, "..", "..");

const { values: arg } = parseArgs({
  options: {
    stare: { type: "string", default: "triat_da" },
    max: { type: "string", default: "10" },
    ids: { type: "string" },
    model: { type: "string", default: process.env.LEGI_MODEL_INTERPRETARE ?? "claude-sonnet-5-5" },
    versiune: { type: "string", default: "v3" },
    "buget-usd": { type: "string", default: "2" },
    "dry-run": { type: "boolean", default: false },
    din: { type: "string" },
    out: { type: "string" },
  },
});

const model = arg.model!;
const bugetUsd = Number(arg["buget-usd"]);
const max = Number(arg.max);
const azi = new Date().toISOString().slice(0, 10);
const cheiFisier = (id: string) => id.replace(/[^A-Za-z0-9._-]/g, "_");

async function main(): Promise<number> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Lipsește ANTHROPIC_API_KEY din .env.local.");
  if (!PRETURI[model]) throw new Error(`Model fără preț cunoscut: ${model} (modele: ${Object.keys(PRETURI).join(", ")}).`);
  if (!Number.isFinite(bugetUsd) || bugetUsd <= 0) throw new Error("--buget-usd trebuie să fie un număr pozitiv.");
  if (arg.din && !arg.out) throw new Error("Cu --din dă și --out <director>.");
  if (!["triat_da", "candidat"].includes(arg.stare!)) throw new Error("--stare: triat_da sau candidat.");

  // ce interpretăm: { id, text } din fișiere sau din Supabase
  type Element = { id: string; text: string | null; problema?: string };
  const vrute = arg.ids ? arg.ids.split(",").map((s) => s.trim()).filter(Boolean) : null;
  const sb = arg.din ? null : clientSupabase({ scriere: !arg["dry-run"] });
  let elemente: Element[];
  if (arg.din) {
    const cheiVrute = vrute ? new Set(vrute.map(cheiFisier)) : null;
    const stems = (await readdir(arg.din)).filter((f) => f.endsWith(".txt")).map((f) => f.replace(/\.txt$/, "")).sort();
    elemente = [];
    for (const s of stems) if (!cheiVrute || cheiVrute.has(s)) elemente.push({ id: s, text: await readFile(path.join(arg.din, `${s}.txt`), "utf8") });
  } else {
    const coloane = "id, titlu, url, mo_ref, publicat_la, data_vigoare, text, lungime, articole, triaj, stare_procesare";
    let q = sb!.from("acte").select(coloane);
    q = vrute ? q.in("id", vrute) : q.eq("stare_procesare", arg.stare!).order("id").limit(max);
    const randuri: any[] = verifica(await q, "acte") ?? [];
    elemente = randuri.map((a) => {
      if (!a.text) return { id: a.id, text: null, problema: "actul nu are text în Supabase" };
      const t = textPentruModel(a);
      if (t.avertisment) console.error(`! ${a.id}: ${t.avertisment}`);
      return { id: a.id, text: t.text };
    });
  }
  if (!elemente.length) {
    console.error("Niciun act de interpretat.");
    return 0;
  }

  const sistem = await construiesteSistem(azi, (f) => readFile(path.join(RAD, f), "utf8"));
  const client = new Anthropic();
  const dirOut = arg.out ?? null;
  const dirErori = dirOut ?? path.join(RAD, "scratch", "interpretare-erori");
  if (dirOut) await mkdir(dirOut, { recursive: true });

  const total = { input: 0, cache_write: 0, cache_read: 0, output: 0, usd: 0, secunde: 0 };
  let incercate = 0;
  let ok = 0;
  let picate = 0;
  let esuate = 0;
  let ramase = 0;
  let oprit = false;

  for (let i = 0; i < elemente.length; i++) {
    const el = elemente[i];
    // oprim înainte de apel dacă media apelurilor de până acum ar depăși bugetul
    const medie = incercate ? total.usd / incercate : 0;
    if (total.usd + medie > bugetUsd) {
      oprit = true;
      ramase = elemente.length - i;
      console.error(`Buget de $${bugetUsd} atins (cheltuit $${total.usd.toFixed(4)}); mai rămân ${ramase} acte pentru o rulare viitoare.`);
      break;
    }
    incercate++;
    if (el.text === null) {
      esuate++;
      console.log(`✗ ${el.id}: ${el.problema}`);
      continue;
    }
    const r = await interpreteazaText(client as any, { model, sistem, text: el.text });
    if (r.usage) {
      total.input += r.usage.input_tokens ?? 0;
      total.cache_write += r.usage.cache_creation_input_tokens ?? 0;
      total.cache_read += r.usage.cache_read_input_tokens ?? 0;
      total.output += r.usage.output_tokens ?? 0;
      total.usd += r.usd ?? 0;
    }
    if (!r.ok) {
      esuate++;
      console.log(`✗ ${el.id}: ${r.detalii}`);
      if (r.brut !== undefined) {
        await mkdir(dirErori, { recursive: true });
        await writeFile(path.join(dirErori, `${cheiFisier(el.id)}.raw.txt`), r.brut);
      }
      continue;
    }
    total.secunde += r.secunde;
    ok++;
    const cost = { input: r.usage.input_tokens ?? 0, cache_write: r.usage.cache_creation_input_tokens ?? 0, cache_read: r.usage.cache_read_input_tokens ?? 0, output: r.usage.output_tokens ?? 0, usd: Number(r.usd.toFixed(4)), secunde: Number(r.secunde.toFixed(1)) };
    const { verificari, rand } = pregatesteRand({ actId: el.id, model, driver: "api", versiune: arg.versiune!, interpretare: r.interpretare, text: el.text, azi, usage: cost });
    for (const linie of liniiVerificare(el.id, r.interpretare, verificari)) console.log(linie);
    console.log(`    ${r.secunde.toFixed(1)} s · $${r.usd.toFixed(4)} · cache citit ${cost.cache_read}`);
    if (!verificari.ok) picate++;

    if (dirOut) await writeFile(path.join(dirOut, `${cheiFisier(el.id)}.json`), JSON.stringify(r.interpretare, null, 2) + "\n");
    else if (sb) {
      if (arg["dry-run"]) continue;
      await urcaInterpretare(sb, rand, el.id, verifica);
    }
  }

  const costFinal = { model, actele: incercate, ok, verificari_picate: picate, apeluri_esuate: esuate, ...total, usd: Number(total.usd.toFixed(4)) };
  if (dirOut) await writeFile(path.join(dirOut, "cost.json"), JSON.stringify(costFinal, null, 2) + "\n");
  console.log(
    `\n${incercate} acte încercate, ${ok} interpretate, ${picate} cu verificări picate, ${esuate} apeluri eșuate · $${total.usd.toFixed(4)} · ${total.secunde.toFixed(0)} s` +
      (arg["dry-run"] && !dirOut ? " (dry-run, nimic urcat)" : "") +
      (oprit ? ` · oprit de buget, ${ramase} acte rămase` : ""),
  );
  return oprit ? 2 : 0;
}

main().then(
  (cod) => process.exit(cod),
  (e) => {
    console.error(`Eroare: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  },
);
