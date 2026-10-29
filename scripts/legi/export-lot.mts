#!/usr/bin/env node
/**
 * Exportă un lot de acte din Supabase în fișiere .txt, în formatul din eval/legi/*.txt, pentru agenții de interpretare.
 *   node --env-file=.env.local --import tsx scripts/legi/export-lot.mts --stare candidat --max 20 --dir scratch/lot
 *   node --env-file=.env.local --import tsx scripts/legi/export-lot.mts --ids portal:293109,portal:305208
 * Nu vorbește cu Portalul, doar cu Supabase. Scrie și <dir>/manifest.json.
 *   --din scratch/acte   citește rândurile din fișierele scrise de `descopera --dump` (fără Supabase)
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { articolDupaNumar, type ActParsat } from "../../lib/portal.ts";
import { clientSupabase, verifica } from "./db.mjs";

const LIMITA_TEXT_INTEGRAL = 120_000;

const { values: arg } = parseArgs({
  options: {
    stare: { type: "string" },
    ids: { type: "string" },
    max: { type: "string", default: "20" },
    dir: { type: "string", default: "scratch/lot" },
    din: { type: "string" },
  },
});

if (!arg.din && (arg.stare === undefined) === (arg.ids === undefined)) {
  console.error("Alege exact una: --stare candidat|triat_da sau --ids portal:123,portal:456 (sau --din <dir>).");
  process.exit(1);
}

let acte: any[];
if (arg.din) {
  const vrute = arg.ids ? new Set(arg.ids.split(",").map((s) => s.trim())) : null;
  const fisiere = (await readdir(arg.din)).filter((f) => f.endsWith(".json") && f !== "manifest.json");
  acte = [];
  for (const f of fisiere) {
    const r = JSON.parse(await readFile(path.join(arg.din, f), "utf8"));
    if (!vrute || vrute.has(r.id)) acte.push(r);
  }
  acte.sort((a, b) => String(a.id).localeCompare(String(b.id)));
} else {
  const sb = clientSupabase();
  const coloane = "id, titlu, url, data_vigoare, text, lungime, articole, triaj";
  let q = sb.from("acte").select(coloane);
  if (arg.ids !== undefined) q = q.in("id", arg.ids.split(",").map((s) => s.trim()));
  else q = q.eq("stare_procesare", arg.stare!).order("id").limit(Number(arg.max));
  acte = verifica(await q, "acte") ?? [];
}
if (!acte.length) {
  console.error("Niciun act găsit.");
  process.exit(1);
}

const dir = arg.dir!;
await mkdir(dir, { recursive: true });
const manifest: Record<string, unknown>[] = [];

for (const a of acte) {
  const cerute: string[] = a.triaj?.articole_cerute ?? [];
  const antet = `${String(a.titlu).replace(/\s+/g, " ").trim()}\n${a.url}\nPublicat în: ${a.mo_ref ?? "necunoscut"}${a.publicat_la ? ` (${a.publicat_la})` : ""}\nData intrării în vigoare (Portal): ${a.data_vigoare ?? "necunoscută"}\n\n`;
  const text: string = a.text ?? "";
  let corp: string;
  let avertisment: string | undefined;

  if (cerute.length === 0 && (a.lungime ?? text.length) <= LIMITA_TEXT_INTEGRAL) {
    corp = text;
  } else if (cerute.length === 0) {
    corp = text;
    avertisment = `text integral de ${text.length} caractere, peste ${LIMITA_TEXT_INTEGRAL}, fără articole cerute`;
    console.error(`! ${a.id}: ${avertisment}`);
  } else {
    const parti: string[] = [];
    const gasite: string[] = [];
    for (const nr of cerute) {
      const bucata = articolDupaNumar({ text, articole: a.articole ?? [] } as ActParsat, nr);
      if (bucata === null) {
        console.error(`! ${a.id}: articolul ${nr} nu a fost găsit`);
        continue;
      }
      gasite.push(nr);
      parti.push(`Art. ${nr}\n${bucata}`);
    }
    corp = `${parti.join("\n\n")}\n\nTextul primit conține doar articolele: ${gasite.join(", ")}`;
    if (gasite.length < cerute.length) avertisment = `articole negăsite: ${cerute.filter((n) => !gasite.includes(n)).join(", ")}`;
  }

  const fisier = `${a.id.replace(/[^A-Za-z0-9._-]/g, "_")}.txt`;
  await writeFile(path.join(dir, fisier), `${antet}${corp}\n`);
  manifest.push({ id: a.id, fisier, titlu: a.titlu, lungime: a.lungime, articole_cerute: cerute, ...(avertisment ? { avertisment } : {}) });
  console.error(`✓ ${a.id} → ${fisier} (${corp.length} caractere)`);
}

await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.error(`${manifest.length} acte în ${dir}`);
