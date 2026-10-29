#!/usr/bin/env node
/**
 * Triajul cu model, pe fișiere (fără bază de date). Două moduri:
 *   --din scratch/sweep --export scratch/triaj      scrie loturi de câte 10 candidați (titlu + primele 4.000 de caractere)
 *                                                   în <export>/lot-<n>.md, pentru agenții Haiku
 *   --din scratch/sweep --aplica scratch/triaj      citește <aplica>/*.json ({ "portal:123": { "atinge_banii": true, "motiv": "..." } })
 *                                                   și scrie în fișierele din --din stare_procesare triat_da / triat_nu + triaj.model
 * Rândurile ajung apoi în Supabase cu `legi:incarca` (sau direct, când descopera rulează cu bază).
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const { values: arg } = parseArgs({
  options: { din: { type: "string" }, export: { type: "string" }, aplica: { type: "string" }, marime: { type: "string", default: "10" }, caractere: { type: "string", default: "4000" } },
});
if (!arg.din || (arg.export === undefined) === (arg.aplica === undefined)) {
  console.error("Dă --din <dir> și exact una dintre --export <dir> sau --aplica <dir>.");
  process.exit(1);
}
const fisiere = (await readdir(arg.din)).filter((f) => f.endsWith(".json"));
const rand = async (f: string) => JSON.parse(await readFile(path.join(arg.din!, f), "utf8"));

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
    const corp = parte
      .map((r) => `## ${r.id}\n\n**${String(r.titlu).replace(/\s+/g, " ").trim()}**\nTip: ${r.tip_act} · Emitent: ${r.emitent ?? "?"} · ${r.mo_ref ?? ""}\nMotivele regulilor: ${(r.triaj?.reguli?.motive ?? []).join("; ")}\n\n${String(r.text).slice(0, n)}${String(r.text).length > n ? "\n[…text tăiat…]" : ""}\n`)
      .join("\n---\n\n");
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
