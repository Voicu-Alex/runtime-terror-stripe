#!/usr/bin/env node
/**
 * Trimite documentele din test-docs/ la /api/analiza-document și compară etichetele cu cele așteptate.
 * Cere serverul pornit (npm run dev) și ANTHROPIC_API_KEY în .env.local.
 *
 *   node scripts/verifica-test-docs.mjs [http://localhost:3000]
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const BAZA = process.argv[2] ?? "http://localhost:3000";
const DIR = path.join(import.meta.dirname, "..", "test-docs");

const ASTEPTARI = [
  { fisier: "contract-munca.pdf", tip: "application/pdf", taguri: ["angajat", "it"], valori: { salariu_brut: 12000 }, interzise: ["1990101123456", "RO00TEST0000000000000000"] },
  { fisier: "factura-gaz.pdf", tip: "application/pdf", taguri: ["consumator_gaz"], valori: { suma_factura: 553.44 }, nu: ["consumator_energie"] },
  { fisier: "fluturas-salariu.png", tip: "image/png", taguri: ["angajat", "constructii", "pilon3"], valori: { salariu_brut: 6500, salariu_net: 3802 } },
];

let esecuri = 0;
for (const a of ASTEPTARI) {
  const form = new FormData();
  form.append("fisier", new Blob([await readFile(path.join(DIR, a.fisier))], { type: a.tip }), a.fisier);
  const r = await fetch(`${BAZA}/api/analiza-document`, { method: "POST", body: form });
  const json = await r.json();
  if (!r.ok) {
    console.log(`✗ ${a.fisier}: ${r.status} ${json.eroare ?? ""}`);
    esecuri++;
    continue;
  }
  const propuse = json.etichete_propuse.map((e) => e.tag);
  const probleme = [];
  for (const t of a.taguri) if (!propuse.includes(t)) probleme.push(`lipsește eticheta ${t}`);
  for (const t of a.nu ?? []) if (propuse.includes(t)) probleme.push(`eticheta nedorită ${t}`);
  for (const [k, v] of Object.entries(a.valori)) if (json.valori[k] !== v) probleme.push(`${k}: așteptat ${v}, primit ${json.valori[k]}`);
  const text = JSON.stringify(json);
  for (const s of a.interzise ?? []) if (text.includes(s)) probleme.push(`date personale nemascate: ${s}`);

  console.log(`${probleme.length ? "✗" : "✓"} ${a.fisier} → ${json.tip_document}; etichete: ${propuse.join(", ") || "niciuna"}`);
  for (const p of probleme) console.log(`    ${p}`);
  if (probleme.length) esecuri++;
}
process.exit(esecuri ? 1 : 0);
