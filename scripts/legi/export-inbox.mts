#!/usr/bin/env node
/**
 * Exportă interpretările în așteptare (interpretari.stare = 'propus') în data/inbox-mo.json, în formatul inbox-ului
 * din PR #34: o listă de acte, fiecare cu schimbările propuse. Citește din Supabase, scrie un singur fișier.
 *   node --env-file=.env.local --import tsx scripts/legi/export-inbox.mts [--out data/inbox-mo.json]
 */
import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { clientSupabase, verifica } from "./db.mjs";

const { values: arg } = parseArgs({ options: { out: { type: "string", default: "data/inbox-mo.json" } } });

try {
  const sb = clientSupabase();
  const rezultate: any[] =
    verifica(await sb.from("interpretari").select("id, model, rezultat, acte(id, url, titlu)").eq("stare", "propus").order("id"), "interpretari") ?? [];
  const acte = rezultate.map((r) => {
    const rez = r.rezultat;
    const act = Array.isArray(r.acte) ? r.acte[0] : r.acte;
    return {
      cheie: act.id,
      act: rez.act,
      mo: rez.mo,
      publicat_la: rez.publicat_la,
      atinge_banii: rez.atinge_banii,
      sursa_url: act.url,
      titlu_en: null,
      schimbari: (rez.schimbari ?? []).map((s: object) => ({ ...s, en: null })),
    };
  });
  const modele = [...new Set(rezultate.map((r) => r.model))];
  const inbox = { sursa: "supabase:interpretari", model: modele.join(", "), cost_usd_pe_act: null, acte };
  await writeFile(arg.out!, JSON.stringify(inbox, null, 2) + "\n", "utf8");
  console.log(`${acte.length} acte în ${arg.out}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
