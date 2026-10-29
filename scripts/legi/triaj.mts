#!/usr/bin/env node
/**
 * Triajul cu model, pe fișiere (fără bază de date). Două moduri:
 *   --din scratch/sweep --export scratch/triaj      scrie loturi de câte 10 candidați (titlu + primele 4.000 de caractere)
 *                                                   în <export>/lot-<n>.md, pentru agenții Haiku
 *   --din scratch/sweep --aplica scratch/triaj      citește <aplica>/*.json ({ "portal:123": { "atinge_banii": true, "motiv": "..." } })
 *                                                   și scrie în fișierele din --din stare_procesare triat_da / triat_nu + triaj.model
 *   --din scratch/sweep --reevalueaza                   rulează din nou regulile de triaj pe rândurile fără verdict de model
 *   --api [--model claude-haiku-5-5] [--max 50] [--marime 10] [--caractere 4000] [--dry-run]
 *                                                   triaj fără om, prin API-ul Anthropic: ia candidații din baza de date (fără --din)
 *                                                   sau din fișiere (cu --din <dir>), trimite loturi modelului și scrie verdictele
 *                                                   ca --aplica. --dry-run doar afișează verdictele. Cere ANTHROPIC_API_KEY.
 * Rândurile ajung apoi în Supabase cu `legi:incarca` (sau direct, când descopera rulează cu bază).
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { triajReguli } from "../../lib/triaj-reguli.ts";
import { construiesteLot, costTriajUsd, INSTRUCTIUNI_TRIAJ, parseazaVerdicte, verdictInTriaj } from "../../lib/triaj-model.ts";

const { values: arg } = parseArgs({
  options: { din: { type: "string" }, export: { type: "string" }, aplica: { type: "string" }, reevalueaza: { type: "boolean", default: false }, marime: { type: "string", default: "10" }, caractere: { type: "string", default: "4000" }, api: { type: "boolean", default: false }, model: { type: "string", default: "claude-haiku-5-5" }, max: { type: "string", default: "50" }, "dry-run": { type: "boolean", default: false } },
});
const moduri = [arg.export !== undefined, arg.aplica !== undefined, arg.reevalueaza, arg.api].filter(Boolean).length;
if (moduri !== 1 || (!arg.din && !arg.api)) {
  console.error("Dă exact una dintre --export <dir>, --aplica <dir>, --reevalueaza (toate cu --din <dir>) sau --api (cu --din <dir> pe fișiere, fără --din pe baza de date).");
  process.exit(1);
}

type Rand = Record<string, any>;
type Sursa = { candidati: () => Promise<Rand[]>; scrie: (r: Rand, update: { triaj: unknown; stare_procesare: string }) => Promise<boolean> };

/** Triajul cu model: loturi către API, verdicte scrise în baza de date sau în fișiere. Întoarce codul de ieșire. */
async function triajApi(): Promise<number> {
  const marime = Number(arg.marime), caractere = Number(arg.caractere), max = Number(arg.max);
  const model = arg.model!;
  const azi = new Date().toISOString().slice(0, 10);
  let sursa: Sursa;
  if (arg.din) {
    const fisiereApi = (await readdir(arg.din)).filter((f) => f.endsWith(".json"));
    const dupaId = new Map<string, string>();
    sursa = {
      candidati: async () => {
        const rez: Rand[] = [];
        for (const f of fisiereApi) {
          const r = JSON.parse(await readFile(path.join(arg.din!, f), "utf8"));
          if (r.stare_procesare === "candidat") { rez.push(r); dupaId.set(r.id, f); }
        }
        return rez.sort((a, b) => String(a.id).localeCompare(String(b.id))).slice(0, max);
      },
      scrie: async (r, update) => {
        await writeFile(path.join(arg.din!, dupaId.get(r.id)!), JSON.stringify({ ...r, ...update }) + "\n");
        return true;
      },
    };
  } else {
    // importat aici ca modurile pe fișiere să nu ceară chei Supabase
    const { clientSupabase, verifica } = await import("./db.mjs");
    const db = clientSupabase({ scriere: !arg["dry-run"] });
    sursa = {
      candidati: async () => verifica(await db.from("acte").select("id, titlu, tip_act, emitent, mo_ref, text, triaj").eq("stare_procesare", "candidat").order("id").limit(max), "citirea candidaților"),
      scrie: async (r, update) => {
        const rez = verifica(await db.from("acte").update(update).eq("id", r.id).eq("stare_procesare", "candidat").select("id"), `scrierea verdictului pentru ${r.id}`);
        return rez.length > 0;
      },
    };
  }

  const candidati = await sursa.candidati();
  const client = new Anthropic();
  const total = { acte: 0, da: 0, nu: 0, lipsa: 0, usd: 0, loturiEsuate: 0 };
  const dormi = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const cheama = async (corp: string) => {
    for (let incercare = 0; ; incercare++) {
      try {
        return await client.messages
          .stream({
            model,
            max_tokens: 4000,
            system: [{ type: "text", text: INSTRUCTIUNI_TRIAJ, cache_control: { type: "ephemeral" } }],
            messages: [{ role: "user", content: `${corp}\n\nÎntoarce doar obiectul JSON cu un verdict pentru fiecare act de mai sus.` }],
          })
          .finalMessage();
      } catch (e) {
        const status = e instanceof Anthropic.APIError ? e.status : undefined;
        if (incercare === 0 && status !== undefined && (status === 429 || status >= 500)) {
          console.error(`  ${status}, reîncerc după 20 s`);
          await dormi(20_000);
          continue;
        }
        throw e;
      }
    }
  };

  for (let i = 0, lot = 0; i < candidati.length; i += marime, lot++) {
    const parte = candidati.slice(i, i + marime);
    const ids = parte.map((r) => String(r.id));
    const t0 = Date.now();
    try {
      const r = await cheama(construiesteLot(parte as unknown as Parameters<typeof construiesteLot>[0], caractere));
      const usd = costTriajUsd(r.usage, model);
      total.usd += usd;
      if (r.stop_reason === "refusal") { console.error(`✗ lot ${lot}: refuz, actele rămân neatinse (${ids.join(", ")})`); total.loturiEsuate++; continue; }
      const brut = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
      const { verdicte, lipsa, invalide } = parseazaVerdicte(brut, ids);
      if (Object.keys(verdicte).length === 0) { console.error(`✗ lot ${lot}: JSON nevalid sau gol (stop_reason ${r.stop_reason}), actele rămân neatinse (${ids.join(", ")})`); total.loturiEsuate++; continue; }
      let da = 0, nu = 0;
      for (const act of parte) {
        const v = verdicte[act.id];
        if (!v) continue;
        if (arg["dry-run"]) console.log(`  ${v.atinge_banii ? "DA" : "nu"}  ${act.id}  ${String(act.titlu).replace(/\s+/g, " ").slice(0, 90)}\n      ${v.motiv}`);
        else if (!(await sursa.scrie(act, verdictInTriaj(act.triaj, v, model, azi)))) { console.error(`  ${act.id}: nu mai e candidat, sărit`); continue; }
        v.atinge_banii ? da++ : nu++;
      }
      total.acte += parte.length; total.da += da; total.nu += nu; total.lipsa += lipsa.length + invalide.length;
      const sec = ((Date.now() - t0) / 1000).toFixed(1).replace(".", ",");
      console.log(`✓ lot ${lot}: ${parte.length} acte, ${da} da / ${nu} nu, ${sec} s, $${usd.toFixed(4)}${lipsa.length + invalide.length ? ` · fără verdict valid: ${[...lipsa, ...invalide].join(", ")}` : ""}`);
    } catch (e) {
      console.error(`✗ lot ${lot}: ${e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : (e as Error).message}`);
      total.loturiEsuate++;
    }
  }
  console.log(`\n${total.acte} acte · ${total.da} da / ${total.nu} nu · fără verdict ${total.lipsa} · loturi eșuate ${total.loturiEsuate} · $${total.usd.toFixed(4)}${arg["dry-run"] ? " · dry-run, nimic scris" : ""}`);
  return total.acte === 0 && total.loturiEsuate > 0 ? 1 : 0;
}

if (arg.api) {
  try { process.exit(await triajApi()); } catch (e) { console.error((e as Error).message); process.exit(1); }
}

const fisiere = (await readdir(arg.din!)).filter((f) => f.endsWith(".json"));
const rand = async (f: string) => JSON.parse(await readFile(path.join(arg.din!, f), "utf8"));

if (arg.reevalueaza) {
  const dupaStare = new Map<string, number>();
  for (const f of fisiere) {
    const r = await rand(f);
    if (!["candidat", "respins_reguli"].includes(r.stare_procesare) || r.triaj?.model) { dupaStare.set(r.stare_procesare, (dupaStare.get(r.stare_procesare) ?? 0) + 1); continue; }
    const reguli = triajReguli(r);
    const fortat = r.triaj?.reguli?.fortat === true;
    r.triaj = { ...(r.triaj ?? {}), reguli: { ...reguli, ...(fortat ? { fortat: true } : {}) } };
    r.stare_procesare = fortat || reguli.candidat ? "candidat" : "respins_reguli";
    await writeFile(path.join(arg.din, f), JSON.stringify(r) + "\n");
    dupaStare.set(r.stare_procesare, (dupaStare.get(r.stare_procesare) ?? 0) + 1);
  }
  for (const [k, v] of [...dupaStare].sort()) console.log(`${String(v).padStart(6)}  ${k}`);
  process.exit(0);
}

if (arg.export) {
  const candidati: Record<string, unknown>[] = [];
  for (const f of fisiere) {
    const r = await rand(f);
    if (r.stare_procesare === "candidat") candidati.push(r);
  }
  candidati.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  await mkdir(arg.export, { recursive: true });
  const marime = Number(arg.marime);
  const n = Number(arg.caractere);
  let lot = 0;
  for (let i = 0; i < candidati.length; i += marime, lot++) {
    const parte = candidati.slice(i, i + marime);
    const corp = construiesteLot(parte as unknown as Parameters<typeof construiesteLot>[0], n);
    await writeFile(path.join(arg.export, `lot-${String(lot).padStart(2, "0")}.md`), corp + "\n");
  }
  console.log(`${candidati.length} candidați în ${lot} loturi, în ${arg.export}`);
} else {
  const verdicte: Record<string, { atinge_banii: boolean; motiv: string; model?: string }> = {};
  for (const f of (await readdir(arg.aplica!)).filter((x) => x.endsWith(".json"))) Object.assign(verdicte, JSON.parse(await readFile(path.join(arg.aplica!, f), "utf8")));
  let da = 0, nu = 0, lipsa = 0;
  for (const f of fisiere) {
    const r = await rand(f);
    if (r.stare_procesare !== "candidat") continue;
    const v = verdicte[r.id];
    if (!v) { lipsa++; continue; }
    r.stare_procesare = v.atinge_banii ? "triat_da" : "triat_nu";
    r.triaj = { ...(r.triaj ?? {}), model: { atinge_banii: v.atinge_banii, motiv: v.motiv, model: v.model ?? "claude-haiku-5-5 (subagent)", la: new Date().toISOString().slice(0, 10) } };
    await writeFile(path.join(arg.din, f), JSON.stringify(r) + "\n");
    v.atinge_banii ? da++ : nu++;
  }
  console.log(`triat_da ${da} · triat_nu ${nu} · fără verdict ${lipsa}`);
}
