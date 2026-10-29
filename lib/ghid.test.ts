import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { calculeaza, type FormulaId } from "./formule";
import { GHID, GhidInvalid, ordoneaza, valideazaGhid } from "./ghid";

const AZI = "2026-10-28";

describe("ghidul general (/legi)", () => {
  it("are câte o intrare pentru fiecare act din catalog", () => {
    expect(new Set(GHID.map((g) => g.id))).toEqual(new Set(CATALOG.map((s) => s.id)));
  });

  it("respinge un id care nu e în catalog", () => {
    expect(() => valideazaGhid([{ id: "nu_exista", pentru: "x", ce: "y", pasi: ["z"] }], CATALOG)).toThrow(GhidInvalid);
  });

  it("ordonează descrescător după cât poți salva, cu termenele trecute la final", () => {
    const { active, expirate } = ordoneaza(GHID, CATALOG, AZI);
    const sume = active.map((x) => x.salvezi?.lei ?? 0);
    expect(sume).toEqual([...sume].sort((a, b) => b - a));
    expect(active[0].id).toBe("tva_locuinta");
    expect(expirate.map((x) => x.id)).toEqual(["dividende_16"]);
  });

  it("fără sumă de salvat, cel care costă mai mult dacă nu faci nimic vine primul", () => {
    const { active } = ordoneaza(GHID, CATALOG, AZI);
    const faraSalvare = active.filter((x) => !x.salvezi).map((x) => x.pierzi?.lei ?? 0);
    expect(faraSalvare).toEqual([...faraSalvare].sort((a, b) => b - a));
  });

  it("după termen, actul trece la expirate", () => {
    const { active } = ordoneaza(GHID, CATALOG, "2026-11-01");
    expect(active.map((x) => x.id)).not.toContain("motorina_acciza");
  });

  // Sumele de referință din ghid trebuie să fie aceleași cu formulele din catalog, ca cele două pagini să nu se contrazică.
  it.each([
    ["prima_stabilitate", "prima_stabilitate_economie"],
    ["pilon3_deducere", "pilon3_economie"],
    ["cei_d", "cei_d_economie"],
    ["impozit_cladiri_2026", "cladiri_bonificatie"],
    ["impozit_auto_2026", "auto_bonificatie"],
  ] as [string, FormulaId][])("%s: suma de salvat e cea din formula %s", (id, formula) => {
    const g = GHID.find((x) => x.id === id)!;
    expect(g.salvezi!.lei).toBe(Math.round(calculeaza(formula, {})! * 12));
  });

  it("motorina: ghidul păstrează 42,50 lei pentru un singur plin de 50 l", () => {
    expect(GHID.find(x => x.id === "motorina_acciza")!.salvezi).toMatchObject({
      lei: 42.5, cand: "o_data", perioada: "pe plin (50 l)",
    });
  });

  it.each([
    ["constructii_facilitati", "constructii_facilitati"],
    ["impozit_auto_2026", "impozit_auto"],
    ["impozit_cladiri_2026", "impozit_cladiri"],
  ] as [string, FormulaId][])("%s: pierderea e cea din formula %s", (id, formula) => {
    const g = GHID.find((x) => x.id === id)!;
    expect(g.pierzi!.lei).toBe(-Math.round(calculeaza(formula, {})! * 12));
  });

  it("pierderile care depind de profil se potrivesc cu formula pe valorile din ipoteză", () => {
    const pierde = (id: string) => GHID.find((x) => x.id === id)!.pierzi!.lei;
    expect(pierde("it_scutire")).toBe(-Math.round(calculeaza("it_scutire", { salariu_brut: 10000 })! * 12));
    expect(pierde("cass_pensii")).toBe(-Math.round(calculeaza("cass_pensii", { pensie_lunara: 4200 })! * 12));
    expect(pierde("tva_21")).toBe(-Math.round(calculeaza("tva_21", { cheltuieli_lunare: 5000 })! * 12));
    expect(pierde("dividende_16")).toBe(-Math.round(calculeaza("dividende_16", { dividende_anuale: 100000 })! * 12));
  });
});
