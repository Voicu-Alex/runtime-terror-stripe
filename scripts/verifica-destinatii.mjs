#!/usr/bin/env node
/**
 * Verifică zilnic fiecare destinație cu URL din data/destinatii.json:
 * răspunde 200, iar titlul conține textul așteptat (sau e PDF). Ieșire 1 la orice eșec,
 * ca un job zilnic să poată opri publicarea până verifică un om.
 *
 *   node scripts/verifica-destinatii.mjs
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const UA = "ce-inseamna-pentru-mine/0.1 (verificare linkuri)";
const fisier = path.join(import.meta.dirname, "..", "data", "destinatii.json");
const destinatii = JSON.parse(await readFile(fisier, "utf8"));

let esecuri = 0;
for (const [id, d] of Object.entries(destinatii)) {
  if (!d.url) {
    console.log(`· ${id}: ghișeu, fără URL`);
    continue;
  }
  let problema = null;
  try {
    const r = await fetch(d.url, { redirect: "follow", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
    if (r.status !== 200) problema = `status ${r.status}`;
    else if (d.verificare?.tip === "pdf") {
      if (!(r.headers.get("content-type") ?? "").includes("pdf")) problema = `nu e PDF (${r.headers.get("content-type")})`;
    } else if (d.verificare?.tip === "titlu") {
      const titlu = ((await r.text()).match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();
      if (!titlu.includes(d.verificare.contine)) problema = `titlul „${titlu.slice(0, 80)}” nu conține „${d.verificare.contine}”`;
    }
  } catch (e) {
    problema = `eroare de rețea (${e.cause?.code ?? e.message})`;
  }
  if (problema) esecuri++;
  console.log(`${problema ? "✗" : "✓"} ${id}: ${d.url}${problema ? ` → ${problema}` : ""}`);
}
process.exit(esecuri ? 1 : 0);
