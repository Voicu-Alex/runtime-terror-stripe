#!/usr/bin/env node
/**
 * Încarcă în `acte` rândurile scrise de `descopera --dump <dir>` (una sau mai multe rulări fără bază de date).
 *   node --env-file=.env.local --import tsx scripts/legi/incarca.mts --din scratch/acte --din scratch/sweep
 * Nu vorbește cu Portalul. Rândurile deja existente nu sunt atinse (munca de triaj rămâne); cele noi se inserează
 * în loturi de 20. Codurile mari (câțiva MB) se trimit singure.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { clientSupabase, verifica } from "./db.mjs";

const { values: arg } = parseArgs({ options: { din: { type: "string", multiple: true }, "dry-run": { type: "boolean", default: false } } });
if (!arg.din?.length) {
  console.error("Dă cel puțin un --din <dir> cu fișiere scrise de `descopera --dump`.");
  process.exit(1);
}
const randuri = new Map<string, Record<string, unknown>>();
for (const dir of arg.din) {
  for (const f of (await readdir(dir)).filter((x) => x.endsWith(".json") && x !== "manifest.json")) {
    const r = JSON.parse(await readFile(path.join(dir, f), "utf8"));
    if (r?.id && r.titlu) randuri.set(r.id, r);
  }
}
console.log(`${randuri.size} acte în fișiere`);
if (arg["dry-run"]) process.exit(0);

const sb = clientSupabase({ scriere: true });
const ids = [...randuri.keys()];
const existente = new Set<string>();
for (let i = 0; i < ids.length; i += 200) {
  const r = verifica(await sb.from("acte").select("id").in("id", ids.slice(i, i + 200)), "acte (citire)") as { id: string }[];
  for (const x of r) existente.add(x.id);
}
const noi = ids.filter((id) => !existente.has(id)).map((id) => randuri.get(id)!);
console.log(`${existente.size} deja în bază, ${noi.length} de inserat`);
let inserate = 0;
const mari = noi.filter((r) => Number(r.lungime) > 500_000);
const mici = noi.filter((r) => Number(r.lungime) <= 500_000);
for (let i = 0; i < mici.length; i += 20) {
  verifica(await sb.from("acte").insert(mici.slice(i, i + 20)), `acte (inserare ${i})`);
  inserate += Math.min(20, mici.length - i);
  if (inserate % 100 === 0) console.log(`  ${inserate}…`);
}
for (const r of mari) {
  verifica(await sb.from("acte").insert(r), `acte (inserare ${r.id})`);
  inserate++;
}
console.log(`inserate ${inserate}`);
