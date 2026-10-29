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
 *
 * Postgres (jsonb) nu păstrează ordinea cheilor, iar fișierele sunt formatate de mână. Ca diff-ul
 * să arate doar ce s-a editat: o intrare neschimbată se scrie exact cu textul vechi, iar una
 * schimbată primește cheile în ordinea din fișier (cheile noi la final).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { clientSupabase, explicaEroarea } from "./supabase-client.mjs";

const DATE = path.join(import.meta.dirname, "..", "data");

const eObiect = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** `nou` cu cheile în ordinea din `vechi`, recursiv; elementele cu id se potrivesc după id. */
function inOrdinea(nou, vechi) {
  if (Array.isArray(nou)) {
    const dupaId = (x, i) => (Array.isArray(vechi) ? (vechi.find((v) => eObiect(v) && v.id !== undefined && v.id === x?.id) ?? vechi[i]) : undefined);
    return nou.map((x, i) => inOrdinea(x, dupaId(x, i)));
  }
  if (!eObiect(nou)) return nou;
  const chei = eObiect(vechi) ? [...Object.keys(vechi).filter((k) => k in nou), ...Object.keys(nou).filter((k) => !(k in vechi))] : Object.keys(nou);
  return Object.fromEntries(chei.map((k) => [k, inOrdinea(nou[k], vechi?.[k])]));
}

/** Textul fiecărui element din lista de pe primul nivel al fișierului, exact cum e scris. */
function elementeBrute(text) {
  const elemente = [];
  let adancime = 0, inSir = false, start = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inSir) {
      if (c === "\\") i++;
      else if (c === '"') inSir = false;
    } else if (c === '"') inSir = true;
    else if (c === "{" || c === "[") {
      if (++adancime === 2) start = i;
    } else if (c === "}" || c === "]") {
      if (adancime-- === 2) elemente.push(text.slice(start, i + 1));
    }
  }
  return elemente;
}

/** Scrie lista păstrând textul intrărilor neschimbate. */
async function scrie(fisier, lista) {
  const cale = path.join(DATE, fisier);
  const original = await readFile(cale, "utf8").catch(() => "[]");
  const crlf = original.includes("\r\n"); // pe Windows, git scoate fișierele cu CRLF
  const text = original.replace(/\r\n/g, "\n");
  const brute = elementeBrute(text);
  const vechi = JSON.parse(text);
  const indent = (s) => s.replace(/\n/g, "\n  ");
  const elemente = lista.map((intrare) => {
    const i = vechi.findIndex((v) => v.id === intrare.id);
    if (i >= 0 && isDeepStrictEqual(vechi[i], intrare) && brute.length === vechi.length) return brute[i];
    return indent(JSON.stringify(inOrdinea(intrare, vechi[i]), null, 2));
  });
  const iesire = elemente.length ? `[\n  ${elemente.join(",\n  ")}\n]\n` : "[]\n";
  await writeFile(cale, crlf ? iesire.replace(/\n/g, "\r\n") : iesire);
}

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
