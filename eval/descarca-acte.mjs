#!/usr/bin/env node
// Descarcă textul actelor din setul de evaluare prin API-ul SOAP gratuit al Portalului Legislativ
// (fără cheie, fără cont). Textul e forma de bază a actului, nu cea consolidată.
//   node eval/descarca-acte.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ACTE = [
  { id: 308129, an: 2026, numar: 12, cheie: "oug-12-2026-gaz" },
  { id: 305817, an: 2025, numar: 89, cheie: "oug-89-2025-micro" },
  { id: 295106, an: 2025, numar: 6, cheie: "oug-6-2025-energie" },
  { id: 308231, an: 2026, numar: 146, cheie: "hg-146-2026-salariu-minim" },
  { id: 313202, an: 2026, numar: 161, cheie: "lege-161-2026-masuri-fiscale" },
  { id: 309674, an: 2026, numar: 29, cheie: "oug-29-2026" },
  { id: 315641, an: 2026, numar: 204, cheie: "lege-204-2026-aprobare-og-22" },
  { id: 313166, an: 2026, numar: 573, cheie: "hg-573-2026-gaze-investitie" },
  { id: 313295, an: 2026, numar: 603, cheie: "hg-603-2026-energie-siguranta" },
];

const EP = "https://legislatie.just.ro/apiws/FreeWebService.svc/SOAP";
const UA = "ce-inseamna-pentru-mine/0.1 (hackathon prototip)";
const DIR = path.join(import.meta.dirname, "legi");
const env = (b) => `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>${b}</s:Body></s:Envelope>`;
const unesc = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

async function call(op, body) {
  const r = await fetch(EP, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: `"http://tempuri.org/IFreeWebService/${op}"`, "User-Agent": UA },
    body: env(body),
  });
  if (!r.ok) throw new Error(`${op} ${r.status}`);
  return r.text();
}

const tok = (await call("GetToken", '<GetToken xmlns="http://tempuri.org/"/>')).match(/<GetTokenResult>([^<]*)</)[1];
await mkdir(DIR, { recursive: true });

for (const a of ACTE) {
  let gasit = null;
  for (let p = 0; p < 4 && !gasit; p++) {
    const xml = await call(
      "Search",
      `<Search xmlns="http://tempuri.org/"><SearchModel xmlns:a="http://schemas.datacontract.org/2004/07/FreeWebService"><a:NumarPagina>${p}</a:NumarPagina><a:RezultatePagina>20</a:RezultatePagina><a:SearchAn>${a.an}</a:SearchAn><a:SearchNumar>${a.numar}</a:SearchNumar></SearchModel><tokenKey>${tok}</tokenKey></Search>`,
    );
    for (const m of xml.matchAll(/<a:Legi>([\s\S]*?)<\/a:Legi>/g)) {
      const g = (k) => unesc((m[1].match(new RegExp(`<a:${k}>([\\s\\S]*?)</a:${k}>`)) || [, ""])[1]);
      if (g("LinkHtml").endsWith(`/${a.id}`)) gasit = { titlu: g("Titlu"), vigoare: g("DataVigoare"), text: g("Text") };
    }
  }
  if (!gasit) {
    console.log(`✗ ${a.cheie}: nu l-am găsit`);
    continue;
  }
  const text = gasit.text.replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  const antet = `${gasit.titlu.replace(/\s+/g, " ").trim()}\nhttps://legislatie.just.ro/Public/DetaliiDocument/${a.id}\nData intrării în vigoare (Portal): ${gasit.vigoare}\n\n`;
  await writeFile(path.join(DIR, `${a.cheie}.txt`), antet + text + "\n");
  console.log(`✓ ${a.cheie}: ${text.length} caractere`);
}
