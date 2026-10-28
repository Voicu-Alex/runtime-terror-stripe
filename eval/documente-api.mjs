#!/usr/bin/env node
/**
 * Trimite cele 13 documente de test la ruta reală /api/analiza-document (cu cheia din .env.local)
 * și salvează răspunsul în eval/rezultate/<nume>/documente/<fișier>.json, ca eval/scor.mjs să-l noteze.
 * Cere serverul pornit (npm run dev).
 *
 *   node eval/documente-api.mjs [http://localhost:3010] [opus-api]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [BAZA = "http://localhost:3010", NUME = "opus-api"] = process.argv.slice(2);
const DIR = path.join(import.meta.dirname, "..", "test-docs");
const OUT = path.join(import.meta.dirname, "rezultate", NUME, "documente");
const asteptari = JSON.parse(await readFile(path.join(import.meta.dirname, "asteptari-documente.json"), "utf8"));
await mkdir(OUT, { recursive: true });

let total = 0;
for (const fisier of Object.keys(asteptari)) {
  const tip = fisier.endsWith(".pdf") ? "application/pdf" : "image/png";
  const form = new FormData();
  form.append("fisier", new Blob([await readFile(path.join(DIR, fisier))], { type: tip }), fisier);
  const t0 = Date.now();
  const r = await fetch(`${BAZA}/api/analiza-document`, { method: "POST", body: form });
  const sec = (Date.now() - t0) / 1000;
  total += sec;
  const json = await r.json();
  if (!r.ok) {
    console.log(`✗ ${fisier}: ${r.status} ${json.eroare ?? ""}`);
    continue;
  }
  if (json.mod !== "claude") console.log(`! ${fisier}: răspuns în modul ${json.mod}, nu de la model`);
  await writeFile(path.join(OUT, `${fisier}.json`), JSON.stringify(json, null, 2) + "\n");
  console.log(`✓ ${fisier}: ${json.tip_document}; ${json.etichete_propuse.map((e) => e.tag).join(", ") || "fără etichete"} · ${sec.toFixed(1)} s`);
}
console.log(`\nTotal: ${total.toFixed(0)} s`);
