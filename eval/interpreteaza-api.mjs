#!/usr/bin/env node
/**
 * Interpretarea actelor din eval/legi prin API-ul real (aceleași instrucțiuni v2 ca subagenții).
 * Promptul de sistem = instrucțiunile + fișierele pe care le citeau subagenții (etichete, formule,
 * tipuri de formulă, câmpuri de profil, destinații), memorat în cache între acte.
 *
 *   node --env-file=.env.local eval/interpreteaza-api.mjs <model> [act ...]
 *   ex.: node --env-file=.env.local eval/interpreteaza-api.mjs claude-sonnet-5-5
 *   LOT=scratch/lot node --env-file=.env.local eval/interpreteaza-api.mjs claude-haiku-5-5 portal-293109
 *
 * Scrie eval/rezultate/<scurt>-api/legi/<act>.json și eval/rezultate/<scurt>-api/cost.json.
 * Cu LOT=<dir> citește textele din <dir>/*.txt (loturile din scripts/legi/export-lot.mts) și scrie în <dir>-api/.
 * Data de azi se injectează în instrucțiuni în locul lui {{AZI}}.
 */
import Anthropic from "@anthropic-ai/sdk";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const RAD = path.join(import.meta.dirname, "..");
const [model, ...doar] = process.argv.slice(2);
if (!model) throw new Error("dă modelul: claude-sonnet-5-5 sau claude-haiku-5-5");
const scurt = model.replace(/^claude-/, "").replace(/-\d.*$/, "");
const LOT = process.env.LOT ? path.resolve(RAD, process.env.LOT) : null;
const DIR_TEXTE = LOT ?? path.join(import.meta.dirname, "legi");
const OUT = LOT ? `${LOT}-api` : path.join(import.meta.dirname, "rezultate", `${scurt}-api`, "legi");
const AZI = new Date().toISOString().slice(0, 10);

// prețuri de listă, $ pe milion de tokeni (skill claude-api, 2026-10-06)
const PRET = {
  "claude-sonnet-5-5": { in: 2, out: 10, cache_w: 2.5, cache_r: 0.2 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5, cache_w: 0.125, cache_r: 0.01 },
  "claude-opus-5-5": { in: 4, out: 20, cache_w: 5, cache_r: 0.2 },
}[model];

const fisier = async (f) => `### ${f}\n\n\`\`\`\n${await readFile(path.join(RAD, f), "utf8")}\n\`\`\``;
const sistem = [
  (await readFile(path.join(import.meta.dirname, "interpretare", "instructiuni.md"), "utf8")).replaceAll("{{AZI}}", AZI),
  "## Fișierele la care trimit instrucțiunile",
  await fisier("lib/taguri.ts"),
  await fisier("lib/formule.ts"),
  await fisier("lib/formule-tip.ts"),
  await fisier("lib/profil.ts"),
  await fisier("data/destinatii.json"),
].join("\n\n");

const acte = doar.length ? doar : (await readdir(DIR_TEXTE)).filter((f) => f.endsWith(".txt")).map((f) => f.replace(/\.txt$/, ""));
const client = new Anthropic();
await mkdir(OUT, { recursive: true });

const total = { input: 0, cache_write: 0, cache_read: 0, output: 0, usd: 0, secunde: 0 };
for (const act of acte) {
  const text = await readFile(path.join(DIR_TEXTE, `${act}.txt`), "utf8");
  const t0 = Date.now();
  try {
    // streaming: actele lungi pot da răspunsuri lungi (gândirea intră în max_tokens)
    const r = await client.messages
      .stream({
        model,
        max_tokens: 32000,
        system: [{ type: "text", text: sistem, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: `${text}\n\nInterpretează actul de mai sus după instrucțiuni și întoarce doar obiectul JSON.` }],
      })
      .finalMessage();

    const sec = (Date.now() - t0) / 1000;
    const u = r.usage;
    const usd =
      ((u.input_tokens ?? 0) * PRET.in + (u.cache_creation_input_tokens ?? 0) * PRET.cache_w + (u.cache_read_input_tokens ?? 0) * PRET.cache_r + (u.output_tokens ?? 0) * PRET.out) /
      1e6;
    total.input += u.input_tokens ?? 0;
    total.cache_write += u.cache_creation_input_tokens ?? 0;
    total.cache_read += u.cache_read_input_tokens ?? 0;
    total.output += u.output_tokens ?? 0;
    total.usd += usd;
    total.secunde += sec;

    if (r.stop_reason === "refusal") {
      console.log(`✗ ${act}: refuz (${r.stop_details?.category ?? "?"})`);
      continue;
    }
    const brut = r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    // modelul poate pune JSON-ul într-un bloc ```json; îl scoatem de acolo
    const json = brut.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? brut.slice(brut.indexOf("{"), brut.lastIndexOf("}") + 1);
    let obj;
    try {
      obj = JSON.parse(json);
    } catch {
      await writeFile(path.join(OUT, `${act}.raw.txt`), brut);
      console.log(`✗ ${act}: JSON invalid (stop_reason ${r.stop_reason}), răspunsul brut salvat`);
      continue;
    }
    await writeFile(path.join(OUT, `${act}.json`), JSON.stringify(obj, null, 2) + "\n");
    console.log(`✓ ${act}: ${obj.schimbari?.length ?? 0} schimbări · ${sec.toFixed(1)} s · $${usd.toFixed(4)} · cache citit ${u.cache_read_input_tokens ?? 0}`);
  } catch (e) {
    console.log(`✗ ${act}: ${e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e.message}`);
  }
}
await writeFile(path.join(path.dirname(OUT), "cost.json"), JSON.stringify({ model, ...total, usd: Number(total.usd.toFixed(4)) }, null, 2) + "\n");
console.log(`\nTotal ${model}: $${total.usd.toFixed(4)} · ${total.secunde.toFixed(0)} s · input ${total.input} · cache scris ${total.cache_write} · cache citit ${total.cache_read} · output ${total.output}`);
