import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { esteFormulaTip, evalueazaTip, formeNumar, formulaCompleta, necesita, numereDinLege, parametriInText, type FormulaTip } from "./formule-tip";

const act = (nume: string) => readFileSync(path.join(__dirname, "..", "eval", "legi", `${nume}.txt`), "utf8");
const salariuMinim: FormulaTip = { tip: "diferenta_prag", parametri: { camp: "salariu_brut", prag: 4325, perioada: "luna" } };

describe("calculul", () => {
  it("salariul minim: de la 4.050 la 4.325 lei brut înseamnă +275 lei/lună", () => {
    expect(evalueazaTip(salariuMinim, { salariu_brut: 4050 })).toBe(275);
  });
  it("salariul minim: cine are peste prag nu câștigă nimic", () => {
    expect(evalueazaTip(salariuMinim, { salariu_brut: 8000 })).toBe(0);
  });
  it("fără valoarea din profil: null, iar formula spune ce îi trebuie", () => {
    expect(evalueazaTip(salariuMinim, {})).toBeNull();
    expect(necesita(salariuMinim)).toEqual(["salariu_brut"]);
  });
  it("dividende 10% → 16% pe 24.000 lei/an dau −120 lei/lună, ca formula scrisă de mână", () => {
    const f: FormulaTip = {
      tip: "schimbare_cota",
      parametri: { camp: "dividende_anuale", cota_veche: 10, cota_noua: 16, perioada: "an", sursa_veche: "Codul fiscal art. 97 alin. (7), forma dinainte de Legea 141/2025" },
    };
    expect(evalueazaTip(f, { dividende_anuale: 24000 })).toBe(-120);
  });
  it("sumă fixă: semnul vine din direcție, nu din model", () => {
    expect(evalueazaTip({ tip: "suma_fixa_lunar", parametri: { lei: 300 } }, {}, "castig")).toBe(300);
    expect(evalueazaTip({ tip: "suma_fixa_lunar", parametri: { lei: 300 } }, {}, "cost")).toBe(-300);
  });
  it("scutire", () => {
    expect(evalueazaTip({ tip: "scutire", parametri: { camp: "cheltuieli_lunare", procent: 50, perioada: "an" } }, { cheltuieli_lunare: 1200 })).toBe(50);
  });
});

describe("numerele trebuie să fie în lege", () => {
  it("4.325 apare în HG 146/2026", () => {
    expect(parametriInText(salariuMinim, act("hg-146-2026-salariu-minim")).ok).toBe(true);
  });
  it("un prag inventat (4.500) e respins", () => {
    const r = parametriInText({ ...salariuMinim, parametri: { ...salariuMinim.parametri, prag: 4500 } }, act("hg-146-2026-salariu-minim"));
    expect(r).toEqual({ ok: false, lipsa: [4500] });
  });
  it("300 lei/lună apare în OUG 89/2025", () => {
    expect(parametriInText({ tip: "suma_fixa_lunar", parametri: { lei: 300 } }, act("oug-89-2025-micro")).ok).toBe(true);
  });
  it("un număr nu e găsit ca parte din alt număr (25 nu se potrivește în 25,949)", () => {
    expect(parametriInText({ tip: "suma_fixa_lunar", parametri: { lei: 25 } }, "reprezentând 25,949 lei/oră").ok).toBe(false);
  });
  it("cota veche nu se caută în actul nou (are sursa ei), cota nouă da", () => {
    const f: FormulaTip = { tip: "schimbare_cota", parametri: { camp: "dividende_anuale", cota_veche: 10, cota_noua: 16, perioada: "an", sursa_veche: "x" } };
    expect(parametriInText(f, "cota de impozit este de 16%").ok).toBe(true);
    expect(esteFormulaTip({ ...f, parametri: { ...f.parametri, sursa_veche: "" } })).toBe(false);
  });
  it("formele românești ale numerelor", () => {
    expect(formeNumar(4325)).toEqual(["4325", "4.325", "4 325"]);
    expect(formeNumar(2.5)).toEqual(["2,5", "2,5", "2,5"]);
  });
});

describe("validarea formei", () => {
  it("acceptă tipurile cunoscute și respinge restul", () => {
    expect(esteFormulaTip(salariuMinim)).toBe(true);
    expect(esteFormulaTip({ tip: "inventata", parametri: {} })).toBe(false);
    expect(esteFormulaTip({ tip: "diferenta_prag", parametri: { camp: "salariu_brut", prag: "mult", perioada: "luna" } })).toBe(false);
  });
});

describe("tipurile noi: suma_fixa, procent_din_camp, multiplu_referinta", () => {
  it("suma_fixa: pe lună rămâne, pe an se împarte la 12, semnul vine din direcție", () => {
    expect(evalueazaTip({ tip: "suma_fixa", parametri: { lei: 300, perioada: "luna" } }, {}, "castig")).toBe(300);
    expect(evalueazaTip({ tip: "suma_fixa", parametri: { lei: 1200, perioada: "an" } }, {}, "castig")).toBe(100);
    expect(evalueazaTip({ tip: "suma_fixa", parametri: { lei: 1200, perioada: "an" } }, {}, "cost")).toBe(-100);
    expect(evalueazaTip({ tip: "suma_fixa", parametri: { lei: -1200, perioada: "an" } }, {}, "cost")).toBe(-100);
  });

  const investitii = (extra: Record<string, number> = {}): FormulaTip => ({
    tip: "procent_din_camp",
    parametri: { camp: "castig_investitii_anual", procent: 10, perioada: "an", ...extra },
  });
  it("procent_din_camp: procent simplu, pe an și pe lună", () => {
    expect(evalueazaTip(investitii(), { castig_investitii_anual: 12000 }, "cost")).toBe(-100);
    const lunar: FormulaTip = { tip: "procent_din_camp", parametri: { camp: "chirie_incasata_lunara", procent: 10, perioada: "luna" } };
    expect(evalueazaTip(lunar, { chirie_incasata_lunara: 2000 }, "cost")).toBe(-200);
    expect(evalueazaTip(lunar, { chirie_incasata_lunara: 2000 }, "castig")).toBe(200);
  });
  it("procent_din_camp: doar peste prag, cu plafon, și sub prag dă 0", () => {
    expect(evalueazaTip(investitii({ peste: 6000 }), { castig_investitii_anual: 18000 }, "cost")).toBe(-100);
    expect(evalueazaTip(investitii({ plafon: 6000 }), { castig_investitii_anual: 18000 }, "cost")).toBe(-50);
    expect(evalueazaTip(investitii({ peste: 6000, plafon: 6000 }), { castig_investitii_anual: 18000 }, "cost")).toBe(-50);
    expect(evalueazaTip(investitii({ peste: 6000 }), { castig_investitii_anual: 3000 }, "cost")).toBe(0);
  });
  it("procent_din_camp: fără valoarea din profil dă null și formula spune ce îi trebuie", () => {
    expect(evalueazaTip(investitii(), {}, "cost")).toBeNull();
    expect(necesita(investitii())).toEqual(["castig_investitii_anual"]);
  });

  const cass: FormulaTip = { tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 6, procent: 10, perioada: "an" } };
  it("multiplu_referinta: CASS 10% din 6 salarii minime pe an, ca lei pe lună", () => {
    // 10% × 6 × 4.325 = 2.595 lei/an → 216,25 lei/lună
    expect(evalueazaTip(cass, {}, "cost", { la: "2026-10-29" })).toBe(-216.25);
    expect(evalueazaTip(cass, {}, "castig", { la: "2026-07-01" })).toBe(216.25);
    expect(necesita(cass)).toEqual([]);
  });
  it("multiplu_referinta: referința se alege după dată; fără intrare la acea dată sau fără referință dă null", () => {
    const referinte = {
      salariu_minim_brut: {
        eticheta: "t",
        unitate: "lei",
        valori: [
          { de_la: "2026-01-01", valoare: 4000, act: "a", sursa: "s", articol: "art. 1", verificat_la: "2026-10-29" },
          { de_la: "2026-07-01", valoare: 5000, act: "a", sursa: "s", articol: "art. 1", verificat_la: "2026-10-29" },
        ],
      },
    };
    const f: FormulaTip = { tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 1, procent: 100, perioada: "luna" } };
    expect(evalueazaTip(f, {}, "castig", { referinte, la: "2026-06-30" })).toBe(4000);
    expect(evalueazaTip(f, {}, "castig", { referinte, la: "2026-07-01" })).toBe(5000);
    expect(evalueazaTip(f, {}, "castig", { referinte, la: "2025-12-31" })).toBeNull();
    expect(evalueazaTip(f, {}, "castig", { referinte: {}, la: "2026-10-29" })).toBeNull();
    // fișierul real nu are valoare dinainte de 1 iulie 2026 (nesursată): null, nu o valoare din memorie
    expect(evalueazaTip(cass, {}, "cost", { la: "2026-06-30" })).toBeNull();
  });
});

describe("schimbare_cota cu cota veche necunoscută", () => {
  const nesursata: FormulaTip = {
    tip: "schimbare_cota",
    parametri: { camp: "dividende_anuale", cota_veche: null, cota_noua: 16, perioada: "an", sursa_veche: null },
  };
  const sursata: FormulaTip = { tip: "schimbare_cota", parametri: { camp: "dividende_anuale", cota_veche: 10, cota_noua: 16, perioada: "an", sursa_veche: "x" } };
  it("nu se calculează, dar e formă validă și incompletă", () => {
    expect(evalueazaTip(nesursata, { dividende_anuale: 24000 })).toBeNull();
    expect(esteFormulaTip(nesursata)).toBe(true);
    expect(formulaCompleta(nesursata)).toBe(false);
    expect(formulaCompleta(sursata)).toBe(true);
  });
  it("una nulă și una setată se respinge, în ambele sensuri", () => {
    expect(esteFormulaTip({ ...nesursata, parametri: { ...nesursata.parametri, cota_veche: 10 } })).toBe(false);
    expect(esteFormulaTip({ ...nesursata, parametri: { ...nesursata.parametri, sursa_veche: "x" } })).toBe(false);
    expect(esteFormulaTip({ ...sursata, parametri: { ...sursata.parametri, cota_veche: null } })).toBe(false);
  });
  it("celelalte tipuri sunt mereu complete", () => {
    expect(formulaCompleta(salariuMinim)).toBe(true);
  });
  it("numai cota nouă se caută în text", () => {
    expect(parametriInText(nesursata, "cota de impozit este de 16%").ok).toBe(true);
    expect(parametriInText(nesursata, "cota de impozit este de 10%").lipsa).toEqual([16]);
  });
});

describe("validarea și numerele tipurilor noi", () => {
  it("esteFormulaTip pentru fiecare tip nou", () => {
    expect(esteFormulaTip({ tip: "suma_fixa", parametri: { lei: 1200, perioada: "an" } })).toBe(true);
    expect(esteFormulaTip({ tip: "suma_fixa", parametri: { lei: 1200 } })).toBe(false);
    expect(esteFormulaTip({ tip: "procent_din_camp", parametri: { camp: "pret_masina", procent: 1, perioada: "an" } })).toBe(true);
    expect(esteFormulaTip({ tip: "procent_din_camp", parametri: { camp: "pret_masina", procent: 1, perioada: "an", peste: 100, plafon: 900 } })).toBe(true);
    expect(esteFormulaTip({ tip: "procent_din_camp", parametri: { camp: "pret_masina", procent: 1, perioada: "an", peste: "mult" } })).toBe(false);
    expect(esteFormulaTip({ tip: "procent_din_camp", parametri: { procent: 1, perioada: "an" } })).toBe(false);
    expect(esteFormulaTip({ tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 6, procent: 10, perioada: "an" } })).toBe(true);
    expect(esteFormulaTip({ tip: "multiplu_referinta", parametri: { multiplu: 6, procent: 10, perioada: "an" } })).toBe(false);
    expect(esteFormulaTip({ tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 6, procent: 10, perioada: "zi" } })).toBe(false);
  });

  const text = "contribuția este de 10% aplicată la 6 salarii minime, dar peste 1.000 lei și până la 50.000 lei, plus 300 lei";
  it("numereDinLege acoperă numerele noi, dar niciodată valoarea referinței", () => {
    expect(numereDinLege({ tip: "suma_fixa", parametri: { lei: 300, perioada: "an" } })).toEqual([300]);
    expect(numereDinLege({ tip: "procent_din_camp", parametri: { camp: "pret_masina", procent: 10, perioada: "an", peste: 1000, plafon: 50000 } })).toEqual([10, 1000, 50000]);
    expect(numereDinLege({ tip: "procent_din_camp", parametri: { camp: "pret_masina", procent: 10, perioada: "an" } })).toEqual([10]);
    const cass: FormulaTip = { tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 6, procent: 10, perioada: "an" } };
    expect(numereDinLege(cass)).toEqual([6, 10]);
    expect(numereDinLege(cass)).not.toContain(4325);
  });
  it("parametriInText: numerele noi trebuie să fie în text, 4.325 nu e cerut pentru multiplu_referinta", () => {
    const cass: FormulaTip = { tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 6, procent: 10, perioada: "an" } };
    expect(parametriInText(cass, text).ok).toBe(true);
    expect(parametriInText({ ...cass, parametri: { ...cass.parametri, multiplu: 12 } } as FormulaTip, text)).toEqual({ ok: false, lipsa: [12] });
    expect(parametriInText({ tip: "procent_din_camp", parametri: { camp: "pret_masina", procent: 10, perioada: "an", peste: 1000, plafon: 50000 } }, text).ok).toBe(true);
    expect(parametriInText({ tip: "procent_din_camp", parametri: { camp: "pret_masina", procent: 10, perioada: "an", plafon: 60000 } }, text).lipsa).toEqual([60000]);
    expect(parametriInText({ tip: "suma_fixa", parametri: { lei: 300, perioada: "an" } }, text).ok).toBe(true);
    expect(parametriInText({ tip: "suma_fixa", parametri: { lei: 301, perioada: "an" } }, text).ok).toBe(false);
  });
});
