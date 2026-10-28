#!/usr/bin/env node
/**
 * Construiește data/inbox-mo.json pentru /admin: actele din Monitorul Oficial interpretate de Claude Sonnet 5.5
 * prin API (eval/rezultate/sonnet-api/legi, rulat pe 28 oct 2026, eval/interpreteaza-api.mjs), exact cum le-a
 * întors modelul. Peste ele punem doar traducerea în engleză (pentru pitch), marcată separat în `en`.
 *
 *   node scripts/genereaza-inbox.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const RAD = path.join(import.meta.dirname, "..");
const REZ = path.join(RAD, "eval/rezultate/sonnet-api");

// Ordinea din inbox: cel mai nou act sus. Id-urile de pe Portalul Legislativ vin din eval/descarca-acte.mjs.
const ACTE = [
  { cheie: "lege-204-2026-aprobare-og-22", portal: 315641 },
  { cheie: "hg-603-2026-energie-siguranta", portal: 313295 },
  { cheie: "hg-573-2026-gaze-investitie", portal: 313166 },
  { cheie: "oug-29-2026", portal: 309674 },
];

// Traducerea în engleză, pe schimbare (cheie, index). Fapte identice cu textul modelului, fără cifre noi.
const EN = {
  "lege-204-2026-aprobare-og-22#0": {
    rezumat: "Up to 200 litres a year of traditional alcoholic drinks are exempt from excise duty for households in the Agricultural Register",
    zero: "A household listed in the Agricultural Register pays no excise duty on up to 200 litres a year of traditional alcoholic drinks, as long as it does not sell them.",
    actiuni: [
      "Check at the town hall whether your household is listed in the Agricultural Register, the condition the law sets for the exemption. The documents for recording the quantities will be set by the implementing rules, which are not in this text yet.",
    ],
    nota: "No tag in the list matches directly: the condition is being listed in the Agricultural Register, not living in a rural area or working in agriculture. The saving cannot be calculated, because the excise amount for these drinks is not in the text. To be checked: which drinks count under “special provisions”, and the implementing rules, not issued yet. The law also approves GO 22/2025, whose content was not in the text received; a person must check whether it changes money for individuals or small businesses.",
  },
  "oug-29-2026#0": {
    rezumat: "From 1 July 2026 a special rule on the minimum wage is repealed; the general rule of the Labour Code applies",
    zero: "From 1 July 2026 a special rule on the minimum wage is repealed, and the guaranteed gross minimum wage is 4,325 lei.",
    actiuni: [
      "If you are on the minimum wage, check on your July payslip, or the following months, that your gross base salary is not below 4,325 lei, the guaranteed gross minimum wage from 1 July 2026. If it does not match, ask payroll for an explanation.",
    ],
    nota: "The content of art. LXX of GEO 156/2024 is not in this text, so we do not know what concretely changes for money or who is affected. A person must check the text of art. LXX before the card appears in the app. The minimum-wage tag comes only from the preamble. No formula: there is no amount in the text.",
  },
};

const TITLU_EN = {
  "lege-204-2026-aprobare-og-22": "Law 204/2026 approving GO 22/2025",
  "hg-603-2026-energie-siguranta": "Government Decision 603/2026 (energy security)",
  "hg-573-2026-gaze-investitie": "Government Decision 573/2026 (gas investment)",
  "oug-29-2026": "Government Emergency Ordinance 29/2026",
};

const cost = JSON.parse(await readFile(path.join(REZ, "cost.json"), "utf8"));
const inbox = [];
for (const { cheie, portal } of ACTE) {
  const j = JSON.parse(await readFile(path.join(REZ, "legi", `${cheie}.json`), "utf8"));
  inbox.push({
    cheie,
    act: j.act,
    mo: j.mo,
    publicat_la: j.publicat_la,
    atinge_banii: j.atinge_banii,
    sursa_url: `https://legislatie.just.ro/Public/DetaliiDocument/${portal}`,
    titlu_en: TITLU_EN[cheie],
    schimbari: (j.schimbari ?? []).map((s, i) => ({ ...s, en: EN[`${cheie}#${i}`] ?? null })),
  });
}

const rezultat = {
  sursa: "eval/rezultate/sonnet-api/legi (Claude Sonnet 5.5 prin API, 28 oct 2026); traducerile din `en` sunt adăugate la revizie",
  model: cost.model,
  // costul mediu pe act, din rularea pe cele 9 acte
  cost_usd_pe_act: Math.round((cost.usd / 9) * 1000) / 1000,
  acte: inbox,
};
await writeFile(path.join(RAD, "data/inbox-mo.json"), JSON.stringify(rezultat, null, 2) + "\n");
console.log(`data/inbox-mo.json: ${inbox.length} acte, ${inbox.reduce((n, a) => n + a.schimbari.length, 0)} schimbări`);
