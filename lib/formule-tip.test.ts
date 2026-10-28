import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { esteFormulaTip, evalueazaTip, formeNumar, necesita, parametriInText, type FormulaTip } from "./formule-tip";

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
