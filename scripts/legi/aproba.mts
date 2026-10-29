#!/usr/bin/env node
/**
 * Aprobă o interpretare propusă: scrie data/catalog.json și data/ghid.json și rândurile din Supabase.
 *   node --env-file=.env.local --import tsx scripts/legi/aproba.mts <id> [--schimbari 0,2] [--revizor adresa@email]
 * `id` e interpretari.id. Fără --schimbari se aprobă toate schimbările din interpretare.
 */
import { parseArgs } from "node:util";
import { aprobaInterpretare } from "../../lib/aprobare.ts";

const { values: arg, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    schimbari: { type: "string" },
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

try {
  const r = await aprobaInterpretare(id, { schimbari, revizor: arg.revizor! });
  console.log(`Aprobat: ${r.schimbareIds.join(", ")}`);
  if (r.avertisment) console.warn(`Atenție: ${r.avertisment}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
