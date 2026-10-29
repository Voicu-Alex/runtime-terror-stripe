#!/usr/bin/env node
/**
 * Urcă data/catalog.json și data/ghid.json în Supabase (tabelele schimbari și ghid).
 * Folosește cheia secretă; rulează-l după ce ai rulat supabase/schema.sql.
 *
 *   npm run supabase:import
 *
 * E idempotent: o intrare existentă se suprascrie cu versiunea din fișier (upsert pe id).
 * Nu șterge rânduri care nu mai sunt în fișiere; pentru asta, folosește dashboard-ul.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { clientSupabase, explicaEroarea } from "./supabase-client.mjs";

const DATE = path.join(import.meta.dirname, "..", "data");
const citeste = async (f) => JSON.parse(await readFile(path.join(DATE, f), "utf8"));
const randuri = (lista) => lista.map((date, ordine) => ({ id: date.id, ordine, date }));

async function main() {
  const catalog = await citeste("catalog.json");
  const ghid = await citeste("ghid.json");
  const supabase = clientSupabase({ scriere: true });

  // întâi catalogul: ghidul are cheie străină spre schimbari
  for (const [tabel, lista] of [["schimbari", catalog], ["ghid", ghid]]) {
    const { error } = await supabase.from(tabel).upsert(randuri(lista), { onConflict: "id" });
    if (error) {
      console.error(`Eroare la „${tabel}”: ${explicaEroarea(error)}`);
      return 1;
    }
    console.log(`${tabel}: ${lista.length} intrări urcate`);
  }
  return 0;
}

// process.exitCode, nu process.exit(): pe Windows, ieșirea forțată cu cereri de rețea deschise oprește Node cu o aserțiune
process.exitCode = await main();
