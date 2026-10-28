#!/usr/bin/env node
// Notează rezultatele din eval/rezultate/<model>/{documente,legi}/ față de așteptări.
//   node eval/scor.mjs [cale-asteptari-documente.json] [cale-asteptari-legi.json]
// Verificările automate sunt regulile pe care le-ar aplica și pipeline-ul înainte de /admin:
// etichete doar din listă, date personale nemascate, citat găsit în textul actului, date, linkuri.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
// aceeași verificare pe care o folosește aplicația: numerele formulei trebuie să fie în textul actului
import { esteFormulaTip, parametriInText } from "../lib/formule-tip.ts";

const RAD = path.join(import.meta.dirname, "..");
const [fDoc = path.join(import.meta.dirname, "asteptari-documente.json"), fLeg = path.join(import.meta.dirname, "asteptari-legi.json")] =
  process.argv.slice(2);

const sursa = async (f) => readFile(path.join(RAD, f), "utf8");
const TAGURI = [...(await sursa("lib/taguri.ts")).matchAll(/^\s+(\w+): \{ familie:/gm)].map((m) => m[1]);
const FORMULE = [...(await sursa("lib/formule.ts")).matchAll(/^\s+(\w+): \(/gm)].map((m) => m[1]);
const TIPURI = ["contract_munca", "factura_utilitati", "fluturas_salariu", "altul"];
const VALORI_OK = ["salariu_net", "salariu_brut", "pensie_lunara", "dividende_anuale", "cheltuieli_lunare", "an_nastere", "nr_copii", "furnizor", "suma_factura", "chirie_lunara"];
const DESTINATII = Object.keys(JSON.parse(await sursa("data/destinatii.json")));
const TIPURI_ACTIUNE = ["fa", "verifica", "nimic_pana_la"];
const CINE = ["tu", "angajator", "furnizor", "stat"];
const DOMENII_OK = ["legislatie.just.ro", "anaf.ro", "static.anaf.ro", "anre.ro", "posf.ro", "asfromania.ro", "cnpp.ro", "mfinante.gov.ro", "gov.ro"];
// „garantat” e interzis ca promisiune, dar „salariul ... garantat în plată” e termenul din lege
const INTERZISE_TEXT = [/recomand/i, /cel mai bun/i, /garantat(?! în plată)/i];

const json = async (f) => JSON.parse(await readFile(f, "utf8"));
const listeaza = async (d) => {
  try {
    return (await readdir(d)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
};
// normalizare pentru căutarea citatului: diacritice cu sedilă = cu virgulă, spații comprimate
const norm = (s) =>
  s.replace(/[şŞ]/g, (c) => (c === "ş" ? "ș" : "Ș")).replace(/[ţŢ]/g, (c) => (c === "ţ" ? "ț" : "Ț")).replace(/[„“”"]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();

const stareLink = new Map();
async function verificaLink(url) {
  if (stareLink.has(url)) return stareLink.get(url);
  let r = "eroare";
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": "ce-inseamna-pentru-mine/0.1 (verificare linkuri)" }, signal: AbortSignal.timeout(15000) });
    r = String(res.status);
  } catch (e) {
    r = "eroare";
  }
  stareLink.set(url, r);
  return r;
}

const modele = (await readdir(path.join(import.meta.dirname, "rezultate"))).filter((m) => !m.startsWith("."));
const rezumat = {};

// ---------- documente ----------
const astDoc = await json(fDoc);
for (const m of modele) {
  const dir = path.join(import.meta.dirname, "rezultate", m, "documente");
  const fis = await listeaza(dir);
  if (!fis.length) continue;
  let ok = 0;
  console.log(`\n## Documente · ${m}`);
  for (const [doc, a] of Object.entries(astDoc)) {
    const f = `${doc}.json`;
    if (!fis.includes(f)) {
      console.log(`✗ ${doc}: lipsește rezultatul`);
      continue;
    }
    const probleme = [];
    let r;
    try {
      r = await json(path.join(dir, f));
    } catch {
      console.log(`✗ ${doc}: JSON invalid`);
      continue;
    }
    const taguri = (r.etichete_propuse ?? []).map((e) => e.tag);
    for (const t of taguri) if (!TAGURI.includes(t)) probleme.push(`etichetă din afara listei: ${t}`);
    if (!TIPURI.includes(r.tip_document)) probleme.push(`tip_document invalid: ${r.tip_document}`);
    for (const e of r.etichete_propuse ?? []) if (!(e.incredere >= 0 && e.incredere <= 1)) probleme.push(`încredere în afara 0–1: ${e.tag}`);
    for (const k of Object.keys(r.valori ?? {})) if (!VALORI_OK.includes(k)) probleme.push(`câmp de valoare necunoscut: ${k}`);
    for (const t of a.taguri ?? []) if (!taguri.includes(t)) probleme.push(`lipsește eticheta ${t}`);
    for (const t of a.nu ?? []) if (taguri.includes(t)) probleme.push(`eticheta nedorită ${t}`);
    if (a.fara_etichete && taguri.length) probleme.push(`trebuia fără etichete, a dat: ${taguri.join(", ")}`);
    for (const [k, v] of Object.entries(a.valori ?? {})) if (r.valori?.[k] !== v) probleme.push(`${k}: așteptat ${v}, primit ${r.valori?.[k]}`);
    const text = JSON.stringify(r);
    for (const s of a.interzise ?? []) if (text.includes(s)) probleme.push(`DATE PERSONALE NEMASCATE: ${s}`);
    if (!probleme.length) ok++;
    console.log(`${probleme.length ? "✗" : "✓"} ${doc} → ${r.tip_document}; ${taguri.join(", ") || "fără etichete"}`);
    for (const p of probleme) console.log(`    ${p}`);
  }
  rezumat[m] = { ...rezumat[m], documente: `${ok}/${Object.keys(astDoc).length}` };
}

// ---------- legi ----------
const astLeg = await json(fLeg);
for (const m of modele) {
  const dir = path.join(import.meta.dirname, "rezultate", m, "legi");
  const fis = await listeaza(dir);
  if (!fis.length) continue;
  console.log(`\n## Legi · ${m}`);
  const tot = {
    acte: 0, triaj: 0, etichete: 0, citate: 0, citateTotal: 0, linkuri: 0, linkuriTotal: 0, linkuriInventate: [],
    formule: 0, formuleTotal: 0, data: 0, ton: 0,
    // v2: acțiuni tipizate, destinații, formule parametrizate
    active: 0, activeCuActiune: 0, actiuni: 0, actiuniValide: 0, cuDestinatie: 0, destinatiiValide: 0, propuse: 0,
    ftTotal: 0, ftInText: 0, cuSuma: 0,
  };
  for (const [act, a] of Object.entries(astLeg)) {
    if (act.startsWith("_")) continue;
    tot.acte++;
    if (!fis.includes(`${act}.json`)) {
      console.log(`✗ ${act}: lipsește rezultatul`);
      continue;
    }
    let r;
    try {
      r = await json(path.join(dir, `${act}.json`));
    } catch {
      console.log(`✗ ${act}: JSON invalid`);
      continue;
    }
    const textAct = norm(await readFile(path.join(import.meta.dirname, "legi", `${act}.txt`), "utf8"));
    const sch = r.schimbari ?? [];
    const taguri = [...new Set(sch.flatMap((s) => s.taguri ?? []))];
    const note = [];

    // triaj
    if (typeof a.atinge_banii === "boolean") {
      if (r.atinge_banii === a.atinge_banii && (a.atinge_banii || sch.length === 0)) tot.triaj++;
      else note.push(`triaj: așteptat atinge_banii=${a.atinge_banii}, primit ${r.atinge_banii} cu ${sch.length} schimbări`);
    } else {
      tot.triaj++; // ambiguu: orice răspuns e acceptabil, se citește manual
      note.push(`triaj ambiguu (manual): atinge_banii=${r.atinge_banii}, ${sch.length} schimbări`);
    }
    // etichete
    const inAfara = taguri.filter((t) => !TAGURI.includes(t));
    const lipsa = (a.taguri_obligatorii ?? []).filter((t) => !taguri.includes(t));
    const nedorite = (a.taguri_interzise ?? []).filter((t) => taguri.includes(t));
    if (a.taguri_interzise_toate && taguri.length) nedorite.push(...taguri);
    if (!inAfara.length && !lipsa.length && !nedorite.length) tot.etichete++;
    if (inAfara.length) note.push(`etichete din afara listei: ${inAfara.join(", ")}`);
    if (lipsa.length) note.push(`lipsesc etichetele: ${lipsa.join(", ")}`);
    if (nedorite.length) note.push(`etichete nedorite: ${nedorite.join(", ")}`);
    // data publicării
    if (!a.publicat_la || r.publicat_la === a.publicat_la) tot.data++;
    else note.push(`publicat_la: așteptat ${a.publicat_la}, primit ${r.publicat_la}`);
    // citate, formule, linkuri, ton
    let tonOk = true;
    for (const s of sch) {
      if (s.citat) {
        tot.citateTotal++;
        if (textAct.includes(norm(s.citat))) tot.citate++;
        else note.push(`citat NEGĂSIT în text: „${s.citat.slice(0, 90)}…”`);
      }
      if (s.formula != null) {
        tot.formuleTotal++;
        if (FORMULE.includes(s.formula)) tot.formule++;
        else note.push(`formulă inexistentă: ${s.formula}`);
      }
      if (s.formula != null || s.formula_tip != null) tot.cuSuma++;
      if (s.formula_tip != null) {
        tot.ftTotal++;
        if (!esteFormulaTip(s.formula_tip)) note.push(`formula_tip invalidă: ${JSON.stringify(s.formula_tip)}`);
        else {
          const r2 = parametriInText(s.formula_tip, await readFile(path.join(import.meta.dirname, "legi", `${act}.txt`), "utf8"));
          if (r2.ok) tot.ftInText++;
          else note.push(`formula_tip: numere NEGĂSITE în text: ${r2.lipsa.join(", ")}`);
        }
      }
      // v2: fiecare schimbare activă are cel puțin o acțiune tipizată
      if (s.status !== "termen_depasit") {
        tot.active++;
        if ((s.actiuni ?? []).length) tot.activeCuActiune++;
        else note.push(`schimbare activă fără acțiune: ${s.rezumat}`);
      }
      for (const ac of s.actiuni ?? []) {
        if (!("tip" in ac)) continue; // rezultat v1
        tot.actiuni++;
        const probl = [];
        if (!TIPURI_ACTIUNE.includes(ac.tip)) probl.push(`tip „${ac.tip}”`);
        if (!CINE.includes(ac.cine_aplica)) probl.push(`cine_aplica „${ac.cine_aplica}”`);
        if (ac.tip === "nimic_pana_la" && !ac.termen) probl.push("nimic_pana_la fără termen");
        if (/https?:\/\//.test(JSON.stringify(ac))) probl.push("URL scris de model");
        if (ac.destinatie != null) {
          tot.cuDestinatie++;
          if (DESTINATII.includes(ac.destinatie)) tot.destinatiiValide++;
          else probl.push(`destinație inexistentă „${ac.destinatie}”`);
        }
        if (ac.destinatie_propusa) tot.propuse++;
        if (probl.length) note.push(`acțiune invalidă (${probl.join(", ")}): ${ac.text?.slice(0, 70)}`);
        else tot.actiuniValide++;
      }
      for (const ac of s.actiuni ?? []) {
        if (!ac.link) continue;
        tot.linkuriTotal++;
        let gazda = "";
        try {
          gazda = new URL(ac.link).hostname.replace(/^www\./, "");
        } catch {}
        const domeniuOk = DOMENII_OK.some((d) => gazda === d || gazda.endsWith(`.${d}`));
        const st = await verificaLink(ac.link);
        if (domeniuOk && st === "200") tot.linkuri++;
        else {
          tot.linkuriInventate.push(`${ac.link} (${st}${domeniuOk ? "" : ", domeniu în afara listei"})`);
          note.push(`link problemă: ${ac.link} → ${st}${domeniuOk ? "" : ", domeniu în afara listei"}`);
        }
      }
      const tot_text = JSON.stringify(s);
      for (const re of INTERZISE_TEXT) if (re.test(tot_text)) {
        tonOk = false;
        note.push(`formulare interzisă: ${re}`);
      }
    }
    if (tonOk) tot.ton++;
    console.log(`${note.filter((n) => !n.startsWith("triaj ambiguu")).length ? "✗" : "✓"} ${act}: atinge_banii=${r.atinge_banii}, ${sch.length} schimbări; ${taguri.join(", ") || "fără etichete"}`);
    for (const n of note) console.log(`    ${n}`);
  }
  rezumat[m] = {
    ...rezumat[m],
    triaj: `${tot.triaj}/${tot.acte}`,
    etichete: `${tot.etichete}/${tot.acte}`,
    data_publicarii: `${tot.data}/${tot.acte}`,
    citate_gasite: `${tot.citate}/${tot.citateTotal}`,
    formule_valide: `${tot.formule}/${tot.formuleTotal}`,
    linkuri_ok: `${tot.linkuri}/${tot.linkuriTotal}`,
    ton: `${tot.ton}/${tot.acte}`,
    active_cu_actiune: `${tot.activeCuActiune}/${tot.active}`,
    ...(tot.actiuni
      ? {
          actiuni_valide: `${tot.actiuniValide}/${tot.actiuni}`,
          destinatii_valide: `${tot.destinatiiValide}/${tot.cuDestinatie}`,
          destinatii_propuse: tot.propuse,
          formula_tip_in_text: `${tot.ftInText}/${tot.ftTotal}`,
          cu_suma: tot.cuSuma,
        }
      : {}),
  };
}

console.log("\n## Rezumat");
console.table(rezumat);
