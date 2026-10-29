#!/usr/bin/env node
/**
 * Descoperă acte pe Portalul Legislativ (legislatie.just.ro) și le salvează în tabelul `acte`.
 * Singurul script care vorbește cu Portalul. O cerere pe rând, pauză fixă, reîncercări cu așteptare,
 * plafon de cereri (vezi lib/portal-client.ts).
 *
 *   node --env-file=.env.local --import tsx scripts/legi/descopera.mts --ids 293109,305208 [--articole 170,84]
 *   node --env-file=.env.local --import tsx scripts/legi/descopera.mts --de-la 314500 --pana-la 315900
 *   node --env-file=.env.local --import tsx scripts/legi/descopera.mts --reia --pana-la 315900
 *   node --env-file=.env.local --import tsx scripts/legi/descopera.mts --cauta-oug 8/2026
 *
 * Opțiuni: --max 1500, --pauza 2000 (ms), --dry-run (fără Supabase: scrie linii JSON pe stdout, textul tăiat),
 * --dump <dir> (rândul complet, cu text, în <dir>/<id>.json; cu --dry-run e calea fără bază de date).
 * Jurnalul și rezumatul merg pe stderr; stdout e curat (linii JSON în --dry-run). Cod de ieșire 2 când Portalul
 * ne oprește (403/429/5xx după reîncercări).
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { ClientPortal, PlafonAtins, PortalIndisponibil } from "../../lib/portal-client.ts";
import { esteLipsa, parseazaPaginaAct, URL_ACT, type ActParsat } from "../../lib/portal.ts";
import { triajReguli } from "../../lib/triaj-reguli.ts";
import { clientSupabase, explicaEroarea, verifica } from "./db.mjs";

const SOAP = "https://legislatie.just.ro/apiws/FreeWebService.svc/SOAP";
const log = (...a: unknown[]) => console.error(...a);

const { values: arg } = parseArgs({
  options: {
    ids: { type: "string" },
    "de-la": { type: "string" },
    "pana-la": { type: "string" },
    reia: { type: "boolean", default: false },
    articole: { type: "string" },
    "cauta-oug": { type: "string" },
    max: { type: "string", default: "1500" },
    pauza: { type: "string", default: "2000" },
    "dry-run": { type: "boolean", default: false },
    // scrie rândul complet (cu tot textul) în <dir>/<id>.json; merge și în --dry-run, ca export-lot --din să poată
    // pregăti loturile înainte să existe tabelele
    dump: { type: "string" },
  },
});

function iesi(mesaj: string, cod = 1): never {
  log(mesaj);
  process.exit(cod);
}

const intreg = (v: string | undefined, nume: string) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) iesi(`--${nume} trebuie să fie un număr întreg, am primit „${v}”.`);
  return n;
};

const max = intreg(arg.max, "max");
const client = new ClientPortal({ max, pauzaMs: intreg(arg.pauza, "pauza"), esteLipsa });

// ---------------------------------------------------------------- --cauta-oug 8/2026
if (arg["cauta-oug"]) {
  const m = arg["cauta-oug"].match(/^(\d+)\/(\d{4})$/);
  if (!m) iesi("Format: --cauta-oug <număr>/<an>, de ex. 8/2026.");
  const env = (b: string) => `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>${b}</s:Body></s:Envelope>`;
  const unesc = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  const soap = async (op: string, corp: string) => {
    const r = await client.ia(SOAP, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: `"http://tempuri.org/IFreeWebService/${op}"` },
      body: env(corp),
    });
    if (r.status !== 200) iesi(`${op}: HTTP ${r.status}`);
    return r.text;
  };
  try {
    const tok = (await soap("GetToken", '<GetToken xmlns="http://tempuri.org/"/>')).match(/<GetTokenResult>([^<]*)</)?.[1];
    if (!tok) iesi("GetToken nu a întors un token.");
    const xml = await soap(
      "Search",
      `<Search xmlns="http://tempuri.org/"><SearchModel xmlns:a="http://schemas.datacontract.org/2004/07/FreeWebService"><a:NumarPagina>0</a:NumarPagina><a:RezultatePagina>20</a:RezultatePagina><a:SearchAn>${m[2]}</a:SearchAn><a:SearchNumar>${m[1]}</a:SearchNumar></SearchModel><tokenKey>${tok}</tokenKey></Search>`,
    );
    const gasite = [...xml.matchAll(/<a:Legi>([\s\S]*?)<\/a:Legi>/g)];
    log(`${gasite.length} rezultate pentru ${arg["cauta-oug"]} (prima pagină, ${client.cereri} cereri)`);
    for (const g of gasite) {
      const camp = (k: string) => unesc((g[1].match(new RegExp(`<a:${k}>([\\s\\S]*?)</a:${k}>`)) || [, ""])[1] ?? "").replace(/\s+/g, " ").trim();
      const link = camp("LinkHtml");
      console.log(JSON.stringify({ id: link.split("/").pop(), TipAct: camp("TipAct"), Numar: camp("Numar"), An: camp("An"), DataVigoare: camp("DataVigoare"), Emitent: camp("Emitent"), Titlu: camp("Titlu").slice(0, 160), LinkHtml: link }));
    }
  } catch (e) {
    if (e instanceof PortalIndisponibil) iesi(e.message, 2);
    throw e;
  }
  await new Promise((r) => setTimeout(r, 200)); // lasă conexiunile să se închidă (altfel libuv se plânge pe Windows)
  process.exit(0);
}

// ---------------------------------------------------------------- moduri
const dryRun = arg["dry-run"];
const modIds = arg.ids !== undefined;
const modInterval = arg["de-la"] !== undefined || arg.reia;
if (modIds === modInterval) iesi("Alege exact un mod: --ids a,b,c sau --de-la N --pana-la M (sau --reia --pana-la M).");
if (arg.articole && !modIds) iesi("--articole merge doar cu --ids.");
if (arg.reia && dryRun) iesi("--reia citește cursorul din Supabase, deci nu merge cu --dry-run.");

const articoleCerute = arg.articole ? arg.articole.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
const sb = dryRun ? null : clientSupabase({ scriere: true });

// Tabelele trebuie să existe înainte de orice cerere către Portal.
if (sb) {
  const { error } = await sb.from("acte").select("id").limit(1);
  if (error) iesi(explicaEroarea(error));
  const r2 = await sb.from("rulari").select("id").limit(1);
  if (r2.error) iesi(explicaEroarea(r2.error));
}

let deLa = 0;
let panaLa = 0;
let lista: number[] = [];
if (modIds) {
  lista = arg.ids!.split(",").map((s) => intreg(s.trim(), "ids"));
  if (!lista.length) iesi("--ids e gol.");
} else {
  panaLa = intreg(arg["pana-la"], "pana-la");
  if (arg.reia) {
    const c = verifica(await sb!.from("cursor_surse").select("ultimul_id").eq("sursa", "portal").maybeSingle(), "cursor_surse");
    if (arg["de-la"] === undefined && !c) iesi("Nu există cursor pentru „portal”: dă --de-la.");
    deLa = arg["de-la"] !== undefined ? intreg(arg["de-la"], "de-la") : Number(c.ultimul_id) + 1;
  } else {
    deLa = intreg(arg["de-la"], "de-la");
  }
  if (deLa > panaLa) iesi(`Intervalul e gol: ${deLa} > ${panaLa}.`);
}

// ---------------------------------------------------------------- rulare
const mod = modIds ? "ids" : "interval";
const parametri = modIds ? { ids: lista, articole: articoleCerute ?? null, max, pauza: arg.pauza } : { de_la: deLa, pana_la: panaLa, reia: arg.reia, max, pauza: arg.pauza };
const inceput = new Date().toISOString();
let rulareId: number | null = null;
if (sb) {
  rulareId = verifica(await sb.from("rulari").insert({ sursa: "portal", mod, parametri, inceput }).select("id").single(), "rulari").id;
}
log(`Rulare ${mod}${dryRun ? " (dry-run)" : ""}: ${modIds ? lista.length + " id-uri" : `${deLa}..${panaLa}`}, max ${max} cereri, pauză ${arg.pauza} ms`);

const azi = new Date().toISOString().slice(0, 10);
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const erori: string[] = [];
const contor = { noi: 0, actualizate: 0, lipsa: 0, nemodificate: 0, eroare: 0 };
const LIPSA_CONSECUTIVE_MAX = 20;
let lipsaConsecutive = 0;
const dupaTip = new Map<string, number>();
const dupaStare = new Map<string, number>();
const numara = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
let ultimulProcesat: number | null = null;
let motivOprire: "gata" | "plafon" | "portal" = "gata";

type Existent = { id: string; text_hash: string | null; stare_procesare: string; triaj: Record<string, unknown> | null };
const STARI_REEVALUABILE = ["respins_reguli", "eroare"];

async function proceseaza(idNum: number) {
  const sursaId = String(idNum);
  const id = `portal:${sursaId}`;
  const url = URL_ACT(sursaId);
  const r = await client.ia(url);

  if (r.status === 404 || esteLipsa(r.text, r.status)) {
    contor.lipsa++;
    // Id-urile sunt dense (0 lipsă în primele 500). Un șir lung de „lipsă” înseamnă că Portalul răspunde cu pagina de
    // eroare la orice, nu că actele nu există: ne oprim ca la o cădere a serverului.
    if (++lipsaConsecutive >= LIPSA_CONSECUTIVE_MAX) throw new PortalIndisponibil(url, `${LIPSA_CONSECUTIVE_MAX} id-uri lipsă la rând`);
    return;
  }
  lipsaConsecutive = 0;

  let act: ActParsat | null = null;
  let motivEroare = r.status !== 200 ? `HTTP ${r.status}` : "";
  if (!motivEroare) {
    try {
      act = parseazaPaginaAct(r.text, sursaId);
    } catch (e) {
      motivEroare = `parsare: ${e instanceof Error ? e.message : String(e)}`;
    }
    if (!act && !motivEroare) motivEroare = "parsare: pagina nu a putut fi interpretată";
  }

  const existent: Existent | null = sb
    ? verifica(await sb.from("acte").select("id, text_hash, stare_procesare, triaj").eq("id", id).maybeSingle(), "acte (citire)")
    : null;

  if (!act) {
    contor.eroare++;
    erori.push(`${id}: ${motivEroare}`);
    log(`  ! ${id}: ${motivEroare}`);
    numara(dupaStare, "eroare");
    if (dryRun) console.log(JSON.stringify({ id, stare_procesare: "eroare", motiv: motivEroare }));
    else if (!existent) {
      verifica(
        await sb!.from("acte").insert({ id, sursa: "portal", sursa_id: sursaId, titlu: `(eroare) ${id}`, url, stare_procesare: "eroare", triaj: { eroare: motivEroare } }),
        "acte (inserare eroare)",
      );
    }
    return;
  }

  const forta = modIds;
  const reguli = triajReguli(act);
  const triaj: Record<string, unknown> = { reguli: { ...reguli, ...(forta ? { fortat: true } : {}) } };
  if (articoleCerute) triaj.articole_cerute = articoleCerute;
  const stareProcesare = forta || reguli.candidat ? "candidat" : "respins_reguli";
  const hash = sha256(act.text);

  const campuriText = {
    tip_act: act.tip_act,
    numar: act.numar,
    an: act.an,
    titlu: act.titlu,
    emitent: act.emitent,
    mo_ref: act.mo_ref,
    publicat_la: act.publicat_la,
    data_vigoare: act.data_vigoare,
    stare_legislativa: act.data_vigoare && act.data_vigoare <= azi ? "in_vigoare" : "adoptat",
    url,
    text: act.text,
    text_hash: hash,
    lungime: act.lungime,
    articole: act.articole,
  };
  numara(dupaTip, act.tip_act || "?");

  if (arg.dump) {
    await mkdir(arg.dump, { recursive: true });
    const rand = { id, sursa: "portal", sursa_id: sursaId, ...campuriText, triaj, stare_procesare: stareProcesare };
    await writeFile(path.join(arg.dump, id.replace(":", "-") + ".json"), JSON.stringify(rand) + "\n");
  }

  if (!existent) {
    contor.noi++;
    numara(dupaStare, stareProcesare);
    const rand = { id, sursa: "portal", sursa_id: sursaId, ...campuriText, triaj, stare_procesare: stareProcesare };
    if (dryRun) console.log(JSON.stringify({ ...rand, text: act.text.slice(0, 300), text_trunchiat: act.text.length > 300 }));
    else verifica(await sb!.from("acte").insert(rand), "acte (inserare)");
    return;
  }

  // Există deja: nu atingem stare_procesare / triaj / descoperit_la (munca făcută rămâne), cu două excepții:
  // rândurile „eroare” / „respins_reguli” nu au muncă de păstrat, deci sunt reevaluate; iar la --ids triaj se îmbină.
  const reevaluabil = STARI_REEVALUABILE.includes(existent.stare_procesare);
  const schimbat = existent.text_hash !== hash;
  const patch: Record<string, unknown> = schimbat ? { ...campuriText } : {};
  if (reevaluabil && (schimbat || forta)) {
    patch.stare_procesare = stareProcesare;
    patch.triaj = { ...(existent.triaj ?? {}), ...triaj, reguli: triaj.reguli };
  } else if (forta) {
    const vechi = existent.triaj ?? {};
    const nou: Record<string, unknown> = { ...vechi, reguli: { ...((vechi.reguli as object) ?? {}), ...(triaj.reguli as object) } };
    if (articoleCerute) nou.articole_cerute = articoleCerute;
    patch.triaj = nou;
  }
  numara(dupaStare, (patch.stare_procesare as string) ?? existent.stare_procesare);
  if (schimbat) {
    contor.actualizate++;
    log(`  ~ ${id}: actualizat (text schimbat)`);
  } else contor.nemodificate++;
  if (!Object.keys(patch).length) return;
  if (dryRun) console.log(JSON.stringify({ id, actualizare: Object.keys(patch) }));
  else verifica(await sb!.from("acte").update(patch).eq("id", id), "acte (actualizare)");
}

async function salveazaCursor() {
  if (!sb || modIds || ultimulProcesat === null) return;
  const c = verifica(await sb.from("cursor_surse").select("ultimul_id").eq("sursa", "portal").maybeSingle(), "cursor_surse");
  const nou = Math.max(ultimulProcesat, c ? Number(c.ultimul_id) : 0);
  verifica(await sb.from("cursor_surse").upsert({ sursa: "portal", ultimul_id: nou }), "cursor_surse (salvare)");
}

const toate = modIds ? lista : { [Symbol.iterator]: function* () { for (let i = deLa; i <= panaLa; i++) yield i; } };
let numarate = 0;
let ultimaAfisare = 0;
try {
  for (const idNum of toate) {
    await proceseaza(idNum);
    ultimulProcesat = idNum;
    numarate++;
    if (client.cereri - ultimaAfisare >= 25) {
      ultimaAfisare = client.cereri;
      log(`[${client.cereri} cereri] la id ${idNum}: ${contor.noi} noi, ${contor.actualizate} actualizate, ${contor.lipsa} lipsă, ${contor.eroare} erori`);
    }
    if (!modIds && numarate % 50 === 0) await salveazaCursor();
  }
} catch (e) {
  if (e instanceof PlafonAtins) {
    motivOprire = "plafon";
    log(`Oprit curat: ${e.message}`);
  } else if (e instanceof PortalIndisponibil) {
    motivOprire = "portal";
    erori.push(e.message);
    log(`OPRIT: ${e.message}`);
  } else throw e;
} finally {
  // Ultimul id procesat complet (cel la care ne-am oprit nu e inclus: n-a ajuns la capăt).
  try {
    await salveazaCursor();
    if (sb && rulareId !== null) {
      verifica(
        await sb
          .from("rulari")
          .update({
            sfarsit: new Date().toISOString(),
            cereri: client.cereri,
            status_200: client.status200,
            status_404: client.status404,
            status_alte: client.statusAlte,
            acte_noi: contor.noi,
            acte_actualizate: contor.actualizate,
            erori: { oprire: motivOprire, mesaje: [...client.erori, ...erori] },
          })
          .eq("id", rulareId),
        "rulari (închidere)",
      );
    }
  } catch (e) {
    log(`Nu am putut scrie jurnalul rulării: ${e instanceof Error ? e.message : e}`);
  }
}

// ---------------------------------------------------------------- rezumat
log(`\nRezumat (${motivOprire === "gata" ? "complet" : "oprit: " + motivOprire})`);
log(`cereri ${client.cereri} | 200: ${client.status200} | 404: ${client.status404} | alte: ${client.statusAlte}`);
log(`acte noi ${contor.noi} | actualizate ${contor.actualizate} | nemodificate ${contor.nemodificate} | lipsă ${contor.lipsa} | erori ${contor.eroare}`);
const tabel = (titlu: string, m: Map<string, number>) => {
  log(`\n${titlu}`);
  for (const [k, v] of [...m].sort((a, b) => b[1] - a[1])) log(`  ${String(v).padStart(5)}  ${k}`);
};
tabel("după tip_act", dupaTip);
tabel("după stare_procesare", dupaStare);
process.exitCode = motivOprire === "portal" ? 2 : 0;
