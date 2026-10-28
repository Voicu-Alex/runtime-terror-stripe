#!/usr/bin/env node
// Câte schimbări, acțiuni și linkuri a propus fiecare model pe setul de legi.
//   node eval/numara-actiuni.mjs
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
  const t = { schimbari: 0, actiuni: 0, cu_link: 0, cu_termen: 0, curios_scris: 0, note_de_verificat: 0 };
  for (const f of fis) {
    const r = JSON.parse(await readFile(path.join(dir, f), "utf8"));
    for (const s of r.schimbari ?? []) {
      t.schimbari++;
      t.actiuni += (s.actiuni ?? []).length;
      t.cu_link += (s.actiuni ?? []).filter((a) => a.link).length;
      t.cu_termen += (s.actiuni ?? []).filter((a) => a.termen).length;
      if (s.niveluri?.curios) t.curios_scris++;
      if (s.nota) t.note_de_verificat++;
    }
  }
  console.log(m, t);
}
