import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { areTraducere } from "./i18n";

// Pitch-ul și demo-ul sunt în engleză: orice text de interfață trecut prin t("…") sau <T k="…" />
// trebuie să aibă intrare în dicționarul EN. Textele verificate pe lege nu trec prin t(), deci nu intră aici.
const RADACINA = path.join(import.meta.dirname, "..");

function fisiere(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) return fisiere(p);
    return /\.tsx?$/.test(f) && !f.includes(".test.") ? [p] : [];
  });
}

function texteDeInterfata(): Map<string, string> {
  const gasite = new Map<string, string>();
  const tipare = [/\bt\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g, /<T k="([^"]*)"/g];
  for (const dir of ["app", "components"]) {
    for (const f of fisiere(path.join(RADACINA, dir))) {
      const sursa = readFileSync(f, "utf8");
      for (const tipar of tipare) for (const m of sursa.matchAll(tipar)) gasite.set(m[1].replace(/\\"/g, '"'), path.relative(RADACINA, f));
    }
  }
  return gasite;
}

describe("acoperirea în engleză", () => {
  it("fiecare text de interfață are traducere", () => {
    const lipsa = [...texteDeInterfata()].filter(([k]) => !areTraducere(k)).map(([k, f]) => `${f}: ${k}`);
    expect(lipsa).toEqual([]);
  });
});
