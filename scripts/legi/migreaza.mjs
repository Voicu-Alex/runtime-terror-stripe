#!/usr/bin/env node
/**
 * Aplică supabase/acte.sql pe baza de date, prin conexiunea directă Postgres.
 *
 *   npm run legi:migreaza
 *
 * Cere SUPABASE_DB_URL în .env.local: Project Settings → Database → Connection string (Session pooler, URI),
 * cu parola. Parola rămâne locală; în repo stă doar numele variabilei (.env.example).
 *
 * Conexiunea e TLS cu verificarea certificatului. Dacă lanțul serverului nu e recunoscut de Node,
 * descarcă certificatul CA din Supabase (Project Settings → Database → SSL Configuration → Download
 * certificate) și pune calea lui în SUPABASE_DB_CA.
 * Scriptul e idempotent (fișierul SQL folosește `if not exists` / `or replace`).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("Lipsește SUPABASE_DB_URL din .env.local. Alternativ, lipește supabase/acte.sql în Supabase → SQL Editor → Run.");
  process.exitCode = 1;
} else {
  const sql = await readFile(path.join(import.meta.dirname, "..", "..", "supabase", "acte.sql"), "utf8");
  const ssl = process.env.SUPABASE_DB_CA ? { ca: await readFile(process.env.SUPABASE_DB_CA, "utf8") } : true;
  // `sslmode` din URL ar suprascrie opțiunea `ssl` (și CA-ul) în pg; îl scoatem.
  const u = new URL(url);
  u.searchParams.delete("sslmode");
  const client = new pg.Client({ connectionString: u.toString(), ssl });
  try {
    await client.connect();
    await client.query(sql);
    const { rows } = await client.query(
      `select table_name, (xpath('/row/c/text()', query_to_xml('select count(*) as c from public.' || table_name, false, true, '')))[1]::text as randuri
         from information_schema.tables
        where table_schema = 'public' and table_name in ('acte', 'interpretari', 'rulari', 'cursor_surse')
        order by table_name`,
    );
    for (const r of rows) console.log(`${r.table_name}: ${r.randuri} rânduri`);
    if (rows.length !== 4) throw new Error(`Așteptam 4 tabele, am găsit ${rows.length}`);
    console.log("Schema aplicată.");
  } catch (e) {
    const tls = /certificate|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(e.message);
    console.error(`Migrarea a eșuat: ${e.message}${tls ? "\nCertificatul serverului nu e recunoscut. Descarcă CA-ul din Supabase (Project Settings → Database → SSL Configuration) și setează SUPABASE_DB_CA=<cale> în .env.local." : ""}`);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}
