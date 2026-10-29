#!/usr/bin/env node
/**
 * Respinge o interpretare propusă (nu se scrie nimic în catalog).
 *   node --env-file=.env.local --import tsx scripts/legi/respinge.mts <id> --nota "de ce" [--revizor adresa@email]
 */
import { parseArgs } from "node:util";
import { respingeInterpretare } from "../../lib/aprobare.ts";

const { values: arg, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    nota: { type: "string" },
    revizor: { type: "string", default: process.env.REVIZOR ?? "linie-de-comanda" },
  },
});

const id = Number(positionals[0]);
if (!Number.isInteger(id) || id <= 0 || !arg.nota?.trim()) {
  console.error('Folosire: respinge.mts <id interpretare> --nota "de ce" [--revizor adresa@email]');
  process.exit(1);
}

try {
  await respingeInterpretare(id, { nota: arg.nota, revizor: arg.revizor! });
  console.log(`Respins: interpretarea ${id}.`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
