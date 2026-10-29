#!/usr/bin/env node
/**
 * Aduce catalogul și ghidul din Supabase și le scrie în data/catalog.json și data/ghid.json.
 * Folosește cheia publică (doar citire). După scriere, `npm run supabase:sync` rulează testele,
 * care validează catalogul (etichete, formule, ghid complet) exact ca la build.
 *
 *   npm run supabase:sync
 *
 * Supabase e locul unde editezi actele; fișierele JSON rămân ce folosește aplicația, deci
 * demo-ul merge și fără internet.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { clientSupabase, explicaEroarea } from "./supabase-client.mjs";

const DATE = path.join(import.meta.dirname, "..", "data");

async function aduce(supabase, tabel) {
  const { data, error } = await supabase.from(tabel).select("id, date").order("ordine");
  if (error) throw new Error(`Eroare la „${tabel}”: ${explicaEroarea(error)}`);
  for (const r of data) if (r.date?.id !== r.id) throw new Error(`${tabel}: rândul „${r.id}” are alt id în date`);
  return data.map((r) => r.date);
}

async function main() {
  const supabase = clientSupabase();
  const catalog = await aduce(supabase, "schimbari");
  const ghid = await aduce(supabase, "ghid");

  if (catalog.length === 0) throw new Error("Tabelul schimbari e gol. Rulează întâi `npm run supabase:import`.");
  const ids = new Set(catalog.map((s) => s.id));
  for (const g of ghid) if (!ids.has(g.id)) throw new Error(`ghid: „${g.id}” nu e în catalog`);
  const faraGhid = catalog.filter((s) => !ghid.some((g) => g.id === s.id)).map((s) => s.id);
  if (faraGhid.length) console.warn(`Atenție: fără intrare în ghid (testele vor pica): ${faraGhid.join(", ")}`);

  const scrie = (f, lista) => writeFile(path.join(DATE, f), JSON.stringify(lista, null, 2) + "\n");
  await scrie("catalog.json", catalog);
  await scrie("ghid.json", ghid);
  console.log(`Scrise: ${catalog.length} acte în data/catalog.json, ${ghid.length} intrări în data/ghid.json`);
}

// process.exitCode, nu process.exit(): pe Windows, ieșirea forțată cu cereri de rețea deschise oprește Node cu o aserțiune
try {
  await main();
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
