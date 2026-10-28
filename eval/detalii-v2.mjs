#!/usr/bin/env node
// Pentru rularea v2: formulele parametrizate, destinațiile alese și cele propuse, pe model.
//   node eval/detalii-v2.mjs
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const REZ = path.join(import.meta.dirname, "rezultate");
for (const m of (await readdir(REZ)).filter((d) => d.endsWith("-v2"))) {
  console.log(`\n## ${m}`);
  const dir = path.join(REZ, m, "legi");
  for (const f of await readdir(dir)) {
    const r = JSON.parse(await readFile(path.join(dir, f), "utf8"));
    for (const s of r.schimbari ?? []) {
      const act = f.replace(".json", "");
      if (s.formula_tip) console.log(`  formula_tip · ${act} · ${JSON.stringify(s.formula_tip)}`);
      if (!s.taguri?.length) console.log(`  FĂRĂ ETICHETE · ${act} · ${s.rezumat}`);
      for (const a of s.actiuni ?? []) {
        console.log(`  ${a.tip}/${a.cine_aplica} → ${a.destinatie ?? "-"} · ${act} · ${a.text.slice(0, 80)}`);
        if (a.destinatie_propusa) console.log(`      propusă: ${typeof a.destinatie_propusa === "string" ? a.destinatie_propusa : JSON.stringify(a.destinatie_propusa)}`);
      }
    }
  }
}
