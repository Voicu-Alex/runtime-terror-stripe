#!/usr/bin/env node
/**
 * Interpretarea actelor din eval/legi prin API-ul real (aceleași instrucțiuni ca subagenții). Logica (promptul de sistem,
 * apelul, extragerea JSON, costul) stă în lib/interpretare-api.ts, aceeași pe care o folosește `npm run legi:interpreteaza`.
 *
 *   node --env-file=.env.local --import tsx eval/interpreteaza-api.mjs <model> [act ...]
 *   ex.: node --env-file=.env.local --import tsx eval/interpreteaza-api.mjs claude-sonnet-5-5
 *   LOT=scratch/lot node --env-file=.env.local --import tsx eval/interpreteaza-api.mjs claude-haiku-5-5 portal-293109
 *
 * Scrie eval/rezultate/<scurt>-api/legi/<act>.json și eval/rezultate/<scurt>-api/cost.json.
 * Cu LOT=<dir> citește textele din <dir>/*.txt (loturile din scripts/legi/export-lot.mts) și scrie în <dir>-api/.
 */
import Anthropic from "@anthropic-ai/sdk";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { construiesteSistem, interpreteazaText } from "../lib/interpretare-api.ts";

const RAD = path.join(import.meta.dirname, "..");
const [model, ...doar] = process.argv.slice(2);
if (!model) throw new Error("dă modelul: claude-sonnet-5-5 sau claude-haiku-5-5");
const scurt = model.replace(/^claude-/, "").replace(/-\d.*$/, "");
const LOT = process.env.LOT ? path.resolve(RAD, process.env.LOT) : null;
const DIR_TEXTE = LOT ?? path.join(import.meta.dirname, "legi");
const OUT = LOT ? `${LOT}-api` : path.join(import.meta.dirname, "rezultate", `${scurt}-api`, "legi");
const AZI = new Date().toISOString().slice(0, 10);

const sistem = await construiesteSistem(AZI, (f) => readFile(path.join(RAD, f), "utf8"));
const acte = doar.length ? doar : (await readdir(DIR_TEXTE)).filter((f) => f.endsWith(".txt")).map((f) => f.replace(/\.txt$/, ""));
const client = new Anthropic();
await mkdir(OUT, { recursive: true });

const total = { input: 0, cache_write: 0, cache_read: 0, output: 0, usd: 0, secunde: 0 };
for (const act of acte) {
  const text = await readFile(path.join(DIR_TEXTE, `${act}.txt`), "utf8");
  const r = await interpreteazaText(client, { model, sistem, text });
  if (r.usage) {
    total.input += r.usage.input_tokens ?? 0;
    total.cache_write += r.usage.cache_creation_input_tokens ?? 0;
    total.cache_read += r.usage.cache_read_input_tokens ?? 0;
    total.output += r.usage.output_tokens ?? 0;
    total.usd += r.usd ?? 0;
  }
  if (!r.ok) {
    if (r.brut !== undefined) await writeFile(path.join(OUT, `${act}.raw.txt`), r.brut);
    console.log(`✗ ${act}: ${r.detalii}`);
    continue;
  }
  total.secunde += r.secunde;
  await writeFile(path.join(OUT, `${act}.json`), JSON.stringify(r.interpretare, null, 2) + "\n");
  console.log(`✓ ${act}: ${r.interpretare.schimbari?.length ?? 0} schimbări · ${r.secunde.toFixed(1)} s · $${r.usd.toFixed(4)} · cache citit ${r.usage.cache_read_input_tokens ?? 0}`);
}
await writeFile(path.join(path.dirname(OUT), "cost.json"), JSON.stringify({ model, ...total, usd: Number(total.usd.toFixed(4)) }, null, 2) + "\n");
console.log(`\nTotal ${model}: $${total.usd.toFixed(4)} · ${total.secunde.toFixed(0)} s · input ${total.input} · cache scris ${total.cache_write} · cache citit ${total.cache_read} · output ${total.output}`);
