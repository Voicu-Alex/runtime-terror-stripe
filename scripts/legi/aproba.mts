#!/usr/bin/env node
/**
 * Aprobă o interpretare propusă: scrie data/catalog.json și data/ghid.json și rândurile din Supabase.
 *   node --env-file=.env.local --import tsx scripts/legi/aproba.mts <id> [--schimbari 0,2] [--cota-veche 1:10:"Legea 227/2015, art. 123"] [--revizor adresa@email]
 * `--cota-veche <i>:<cota>:<sursa>` (repetabil) completează vechea cotă a unei schimbări `schimbare_cota` la care modelul n-a găsit-o.
 * `id` e interpretari.id. Fără --schimbari se aprobă toate schimbările din interpretare.
 */
import { parseArgs } from "node:util";
import { aprobaInterpretare } from "../../lib/aprobare.ts";

const { values: arg, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    schimbari: { type: "string" },
    "cota-veche": { type: "string", multiple: true },
    revizor: { type: "string", default: process.env.REVIZOR ?? "linie-de-comanda" },
  },
});

const id = Number(positionals[0]);
if (!Number.isInteger(id) || id <= 0) {
  console.error("Folosire: aproba.mts <id interpretare> [--schimbari 0,2] [--revizor adresa@email]");
  process.exit(1);
}
const schimbari = arg.schimbari === undefined ? undefined : arg.schimbari.split(",").map((x) => Number(x.trim()));
if (schimbari && schimbari.some((i) => !Number.isInteger(i) || i < 0)) {
  console.error(`--schimbari trebuie să fie indecși de la 0, separați prin virgulă (primit „${arg.schimbari}”).`);
  process.exit(1);
}

const completari: Record<number, { cota_veche: number; sursa_veche: string }> = {};
for (const x of arg["cota-veche"] ?? []) {
  const m = /^(\d+):([^:]+):(.+)$/.exec(x);
  const cota = m ? Number(m[2].trim().replace(",", ".")) : NaN;
  if (!m || !Number.isFinite(cota) || !m[3].trim()) {
    console.error(`--cota-veche trebuie să fie <indice>:<cota>:<sursa> (primit „${x}”).`);
    process.exit(1);
  }
  completari[Number(m[1])] = { cota_veche: cota, sursa_veche: m[3].trim() };
}

try {
  const r = await aprobaInterpretare(id, { schimbari, completari, revizor: arg.revizor! });
  console.log(`Aprobat: ${r.schimbareIds.join(", ")}`);
  if (r.avertisment) console.warn(`Atenție: ${r.avertisment}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
