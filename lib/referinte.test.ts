import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { esteReferinta, REFERINTE, valideazaReferinte, valoareReferinta } from "./referinte";

describe("data/referinte.json", () => {
  it("fiecare valoare are act, sursă, articol, verificat_la și de_la ISO", () => {
    expect(valideazaReferinte()).toEqual([]);
  });
  it("salariul minim: 4.325 lei de la 1 iulie 2026, și numărul chiar e în HG 146/2026", () => {
    const v = REFERINTE.salariu_minim_brut.valori[0];
    expect(v).toMatchObject({ de_la: "2026-07-01", valoare: 4325, act: "HG 146/2026", articol: "art. 1" });
    const hg = readFileSync(path.join(__dirname, "..", "eval", "legi", "hg-146-2026-salariu-minim.txt"), "utf8");
    expect(hg).toContain(v.sursa);
    expect(hg).toContain("4.325 lei");
  });
  it("valideazaReferinte prinde câmpurile lipsă și datele greșite", () => {
    const rea = { x: { eticheta: "e", unitate: "lei", valori: [{ de_la: "iulie", valoare: 1, act: "", sursa: "s", articol: "a", verificat_la: "ieri" }] } };
    expect(valideazaReferinte(rea)).toEqual(["x[0]: de_la nu e dată ISO", "x[0]: verificat_la nu e dată ISO", "x[0]: lipsește act"]);
    const v = { valoare: 1, act: "a", sursa: "s", articol: "a" };
    expect(valideazaReferinte({ x: { eticheta: "e", unitate: "lei", valori: [{ ...v, de_la: "2026-13-45", verificat_la: "2026-02-30" }] } })).toEqual([
      "x[0]: de_la nu e dată ISO",
      "x[0]: verificat_la nu e dată ISO",
    ]);
    expect(valideazaReferinte({ x: { eticheta: "e", unitate: "lei", valori: [] } })).toEqual(["x: nicio valoare"]);
  });
});

describe("valoareReferinta", () => {
  it("alege intrarea cu cel mai mare de_la ≤ data; înainte de prima intrare e null", () => {
    expect(valoareReferinta("salariu_minim_brut", "2026-07-01")).toBe(4325);
    expect(valoareReferinta("salariu_minim_brut", "2030-01-01")).toBe(4325);
    expect(valoareReferinta("salariu_minim_brut", "2026-06-30")).toBeNull();
  });
  it("id necunoscut: null; esteReferinta", () => {
    expect(valoareReferinta("inventata", "2026-10-29")).toBeNull();
    expect(valoareReferinta("toString", "2026-10-29")).toBeNull();
    expect(esteReferinta("salariu_minim_brut")).toBe(true);
    expect(esteReferinta("inventata")).toBe(false);
    expect(esteReferinta("toString")).toBe(false);
  });
});
