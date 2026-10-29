#!/usr/bin/env node
/**
 * Rularea zilnică a ingestiei: descoperă actele noi pe Portal, le triază, le interpretează și lasă propunerile
 * pentru /admin/acte. Trei pași, ca procese separate, în ordine: descopera -> triaj -> interpreteaza.
 *
 *   npm run legi:zilnic
 *   npm run legi:zilnic -- --dry-run --de-la 315770 --pas-ids 6 --max-cereri 6 --sari triaj,interpreteaza
 *   node --import tsx scripts/legi/zilnic.mts            # în CI, unde variabilele vin din secrete, nu din .env.local
 *
 * Opțiuni (între paranteze, valoarea implicită):
 *   --pas-ids 400         câte id-uri după cursor încercăm (≈ 13 zile de Portal, la ≈ 31 de id-uri pe zi)
 *   --max-cereri 400      plafonul de cereri către Portal (pasul descopera)
 *   --max-triaj 100       câte acte triem
 *   --max-interpretari 20 câte acte interpretăm
 *   --buget-usd 2         plafonul de cost pentru interpretare
 *   --dry-run             trece --dry-run fiecărui pas; cere --de-la (nu citește cursorul, nu scrie jurnalul)
 *   --de-la <id>          primul id; obligatoriu cu --dry-run, altfel doar când nu există încă un cursor
 *   --sari a,b            sare peste pași: descopera, triaj, interpreteaza
 *
 * Cod de ieșire: 0 rulare completă (și bugetul consumat la interpretare), 1 eroare, 2 Portalul ne-a oprit.
 * Jurnalul pașilor curge pe ecran; rezumatul final merge pe stdout. Rândul din `rulari` (sursa „zilnic”) are
 * parametrii și, în `erori`, { pasi: [{ pas, cod_iesire, secunde }], oprit_la? }.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  IMPLICITE,
  PASI,
  STARI_PROCESARE,
  argumentePas,
  calculeazaInterval,
  claseazaIesire,
  formateazaDelta,
  opresteRularea,
  tabelDelta,
  type Pas,
} from "../../lib/zilnic.ts";
import { clientSupabase, explicaEroarea, verifica } from "./db.mjs";

const aici = path.dirname(fileURLToPath(import.meta.url));
const radacina = path.resolve(aici, "../..");
const log = (...a: unknown[]) => console.log(...a);

const { values: arg } = parseArgs({
  options: {
    "pas-ids": { type: "string", default: String(IMPLICITE.pasIds) },
    "max-cereri": { type: "string", default: String(IMPLICITE.maxCereri) },
    "max-triaj": { type: "string", default: String(IMPLICITE.maxTriaj) },
    "max-interpretari": { type: "string", default: String(IMPLICITE.maxInterpretari) },
    "buget-usd": { type: "string", default: String(IMPLICITE.bugetUsd) },
    "dry-run": { type: "boolean", default: false },
    "de-la": { type: "string" },
    sari: { type: "string", default: "" },
  },
});

function iesi(mesaj: string, cod = 1): never {
  console.error(mesaj);
  process.exit(cod);
}

const numar = (v: string | undefined, nume: string, zecimal = false) => {
  const n = Number(v);
  if (v === undefined || v === "" || !Number.isFinite(n) || n < 0 || (!zecimal && !Number.isInteger(n))) iesi(`--${nume} trebuie să fie un număr${zecimal ? "" : " întreg"} pozitiv, am primit „${v}”.`);
  return n;
};

const optiuni = {
  pasIds: numar(arg["pas-ids"], "pas-ids"),
  maxCereri: numar(arg["max-cereri"], "max-cereri"),
  maxTriaj: numar(arg["max-triaj"], "max-triaj"),
  maxInterpretari: numar(arg["max-interpretari"], "max-interpretari"),
  bugetUsd: numar(arg["buget-usd"], "buget-usd", true),
  dryRun: arg["dry-run"],
};
const sarite = arg.sari.split(",").map((s) => s.trim()).filter(Boolean);
for (const s of sarite) if (!(PASI as readonly string[]).includes(s)) iesi(`--sari: pas necunoscut „${s}”. Pași: ${PASI.join(", ")}.`);
const deLaArg = arg["de-la"] === undefined ? null : numar(arg["de-la"], "de-la");

const sb = optiuni.dryRun ? null : clientSupabase({ scriere: true });

async function numaraActele() {
  // PostgREST taie select-ul la 1000 de rânduri, deci numărăm pe stare, cu count exact și fără rânduri.
  const rezultate = await Promise.all(STARI_PROCESARE.map((stare) => sb!.from("acte").select("id", { count: "exact", head: true }).eq("stare_procesare", stare)));
  const numar: Record<string, number> = {};
  rezultate.forEach(({ count, error }, i) => {
    if (error) iesi(explicaEroarea(error));
    numar[STARI_PROCESARE[i]] = count ?? 0;
  });
  return numar;
}

let cursor: number | null = null;
let stariInainte: Record<string, number> = {};
if (sb) {
  const r = await sb.from("rulari").select("id").limit(1);
  if (r.error) iesi(explicaEroarea(r.error));
  const c = verifica(await sb.from("cursor_surse").select("ultimul_id").eq("sursa", "portal").maybeSingle(), "cursor_surse");
  cursor = c ? Number(c.ultimul_id) : null;
  stariInainte = await numaraActele();
}

let interval;
try {
  interval = calculeazaInterval({ cursor, pasIds: optiuni.pasIds, deLa: deLaArg, dryRun: optiuni.dryRun });
} catch (e) {
  iesi(e instanceof Error ? e.message : String(e));
}
const deLaAfisat = interval.deLa ?? (cursor ?? 0) + 1;

const inceput = new Date();
const parametri = { ...optiuni, sari: sarite, de_la: deLaAfisat, pana_la: interval.panaLa, cursor };
let rulareId: number | null = null;
if (sb) {
  rulareId = verifica(await sb.from("rulari").insert({ sursa: "zilnic", mod: "zilnic", parametri, inceput: inceput.toISOString() }).select("id").single(), "rulari").id;
}

log(`Rulare zilnică${optiuni.dryRun ? " (dry-run)" : ""}: id-uri ${deLaAfisat} .. ${interval.panaLa}, pași: ${PASI.filter((p) => !sarite.includes(p)).join(" -> ") || "(niciunul)"}`);

const scripturi: Record<Pas, string> = {
  descopera: "scripts/legi/descopera.mts",
  triaj: "scripts/legi/triaj.mts",
  interpreteaza: "scripts/legi/interpreteaza.mts",
};

/** Rulează un script ca proces copil; stdout și stderr curg direct pe ecran. Întoarce codul de ieșire (null dacă n-a pornit). */
function ruleaza(script: string, argumente: string[]): Promise<number | null> {
  return new Promise((rezolva) => {
    // .env.local lipsește în CI (cheile vin din mediu); --env-file cu fișier lipsă ar opri nodul, așa că îl punem doar dacă există.
    const cuEnv = ["--env-file=.env.local"];
    const copil = spawn(process.execPath, [...(existaEnv() ? cuEnv : []), "--import", "tsx", script, ...argumente], { cwd: radacina, stdio: "inherit" });
    copil.on("error", (e) => {
      console.error(`Nu am putut porni ${script}: ${e.message}`);
      rezolva(null);
    });
    copil.on("close", (cod) => rezolva(cod));
  });
}

function existaEnv() {
  return existsSync(path.join(radacina, ".env.local"));
}

const pasi: { pas: Pas; cod_iesire: number | null; secunde: number }[] = [];
let opritLa: Pas | undefined;
let motivOprire = "";
let esteBuget = false;

for (const pas of PASI) {
  if (sarite.includes(pas)) {
    log(`\n== ${pas}: sărit (--sari)`);
    continue;
  }
  const argumente = argumentePas(pas, optiuni, interval);
  log(`\n== ${pas}: ${scripturi[pas]} ${argumente.join(" ")}`);
  const t0 = Date.now();
  const cod = await ruleaza(scripturi[pas], argumente);
  const secunde = Math.round((Date.now() - t0) / 100) / 10;
  pasi.push({ pas, cod_iesire: cod, secunde });
  const rezultat = claseazaIesire(pas, cod);
  log(`== ${pas}: cod de ieșire ${cod ?? "(nu a pornit)"}, ${secunde} s`);
  if (rezultat === "buget") {
    esteBuget = true;
    log("Interpretarea s-a oprit la plafonul de buget; nu e o eroare, restul rămâne pentru rularea de mâine.");
  }
  if (opresteRularea(rezultat)) {
    opritLa = pas;
    motivOprire = rezultat === "oprit_portal" ? "Portalul ne-a oprit (403/429/5xx); nu mai insistăm azi" : `pasul a ieșit cu codul ${cod ?? "necunoscut"}`;
    break;
  }
}

const sfarsit = new Date();
const durata = Math.round((sfarsit.getTime() - inceput.getTime()) / 1000);
let tabel = "";
if (sb) {
  try {
    tabel = formateazaDelta(tabelDelta(stariInainte, await numaraActele()));
  } catch (e) {
    tabel = `(nu am putut număra actele: ${e instanceof Error ? e.message : e})`;
  }
  try {
    verifica(
      await sb
        .from("rulari")
        .update({ sfarsit: sfarsit.toISOString(), erori: { pasi, ...(opritLa ? { oprit_la: opritLa } : {}) } })
        .eq("id", rulareId!),
      "rulari (închidere)",
    );
  } catch (e) {
    console.error(`Nu am putut scrie jurnalul rulării: ${e instanceof Error ? e.message : e}`);
  }
}

log("\n===== Rezumat rulare zilnică =====");
log(`Pași rulați: ${pasi.map((p) => `${p.pas} (cod ${p.cod_iesire ?? "?"}, ${p.secunde} s)`).join(", ") || "(niciunul)"}`);
if (sarite.length) log(`Pași săriți: ${sarite.join(", ")}`);
log(`Durată: ${durata} s`);
if (tabel) log(`Stări (acte):\n${tabel}`);
else if (optiuni.dryRun) log("Stări (acte): omise în --dry-run.");
if (esteBuget && !opritLa) log("Interpretare: oprită de buget (nu e eroare).");
log(opritLa ? `Oprit la ${opritLa}: ${motivOprire}.` : "Rulare completă.");

const codFinal = opritLa ? (claseazaIesire(opritLa, pasi.at(-1)!.cod_iesire) === "oprit_portal" ? 2 : 1) : 0;
process.exitCode = codFinal;
