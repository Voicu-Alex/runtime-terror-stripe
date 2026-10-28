#!/usr/bin/env node
// Listează schimbările fără acțiuni, pe model, cu direcția și starea, ca să vedem de ce lipsesc.
//   node eval/fara-actiuni.mjs
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const REZ = path.join(import.meta.dirname, "rezultate");
for (const m of await readdir(REZ)) {
  const dir = path.join(REZ, m, "legi");
  let fis = [];
  try {
    fis = await readdir(dir);
  } catch {
    continue;
  }
  console.log(`\n## ${m}`);
  for (const f of fis) {
    const r = JSON.parse(await readFile(path.join(dir, f), "utf8"));
    for (const s of r.schimbari ?? []) {
      const n = (s.actiuni ?? []).length;
      console.log(`${n ? "  ✓" : "  ·"} ${f.replace(".json", "")} | ${s.status} | ${s.directie} | ${n} acț. | ${s.rezumat}`);
    }
  }
}
