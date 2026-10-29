import { describe, expect, it } from "vitest";
import type { InterpretareAct } from "./interpretare";
import { act, interp } from "./interpretare.fixtura";
import { verificaInterpretare } from "./verificari-interpretare";

const AZI = "2026-10-29";
const TEXT = act.text ?? "";

/** Aplică o modificare pe prima schimbare. */
const cu = (m: Record<string, unknown>): InterpretareAct => ({ ...interp, schimbari: [{ ...interp.schimbari[0], ...m }] });
const picate = (i: InterpretareAct, text = TEXT) => verificaInterpretare(i, text, { azi: AZI }).picate.map((v) => v.cod);

describe("verificaInterpretare", () => {
  it("trece fixtura HG 146/2026 fără nicio verificare picată", () => {
    const r = verificaInterpretare(interp, TEXT, { azi: AZI });
    expect(r.picate).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.trecute.length).toBeGreaterThan(8);
    expect(r.trecute.find((v) => v.cod === "citat")?.schimbare).toBe(0);
  });

  it("citatul se găsește peste diferențe de diacritice, spații și ghilimele", () => {
    const sedila = cu({ citat: "se stabileşte în bani,   fără a include sporuri\n și alte adaosuri, la suma de 4.325 lei lunar" });
    expect(picate(sedila)).toEqual([]);
  });

  it("pică un citat care nu e în text", () => {
    expect(picate(cu({ citat: "text inventat de model care nu apare nicăieri în act" }))).toContain("citat");
  });

  it("pică etichete din afara listei și lipsa etichetelor", () => {
    expect(picate(cu({ taguri: ["angajat", "inventat"] }))).toContain("taguri");
    expect(picate(cu({ taguri: [] }))).toContain("taguri");
  });

  it("pică o formulă inexistentă", () => {
    expect(picate(cu({ formula: "nu_exista", formula_tip: null }))).toContain("formula");
  });

  it("pică formula_tip invalidă, cu câmp necunoscut sau cu numere care nu sunt în text", () => {
    expect(picate(cu({ formula_tip: { tip: "ceva", parametri: {} } }))).toContain("formula_tip");
    expect(picate(cu({ formula_tip: { tip: "diferenta_prag", parametri: { camp: "nu_e_camp", prag: 4325, perioada: "luna" } } }))).toContain("formula_tip");
    expect(picate(cu({ formula_tip: { tip: "diferenta_prag", parametri: { camp: "salariu_brut", prag: 9999, perioada: "luna" } } }))).toContain("formula_tip_text");
  });

  it("pică o schimbare activă fără acțiune, dar nu un proiect sau una expirată", () => {
    expect(picate(cu({ actiuni: [] }))).toContain("actiune_lipsa");
    expect(picate(cu({ actiuni: [], status: "proiect" }))).not.toContain("actiune_lipsa");
    expect(picate(cu({ actiuni: [], pana_la: "2026-09-01" }))).not.toContain("actiune_lipsa");
  });

  it("pică acțiuni cu tip, cine_aplica sau destinație invalide și nimic_pana_la fără termen", () => {
    const a = interp.schimbari[0].actiuni[0];
    expect(picate(cu({ actiuni: [{ ...a, tip: "altceva" }] }))).toContain("actiune_tip");
    expect(picate(cu({ actiuni: [{ ...a, cine_aplica: "vecinul" }] }))).toContain("actiune_cine");
    expect(picate(cu({ actiuni: [{ ...a, destinatie: "nu_exista" }] }))).toContain("actiune_destinatie");
    expect(picate(cu({ actiuni: [{ ...a, tip: "nimic_pana_la", termen: null }] }))).toContain("actiune_termen");
  });

  it("pică URL-urile scrise de model", () => {
    const a = interp.schimbari[0].actiuni[0];
    expect(picate(cu({ actiuni: [{ ...a, text: "Intră pe https://exemplu.ro și verifică" }] }))).toContain("url");
  });

  it("pică formulările interzise, dar nu „garantat în plată”", () => {
    const n = interp.schimbari[0].niveluri;
    expect(picate(cu({ niveluri: { ...n, zero: "Vă recomandăm să verificați." } }))).toContain("interzise");
    expect(picate(cu({ niveluri: { ...n, zero: "Cel mai bun mod." } }))).toContain("interzise");
    expect(picate(cu({ niveluri: { ...n, zero: "Câștig garantat." } }))).toContain("interzise");
    expect(picate(cu({ niveluri: { ...n, zero: "Salariul garantat în plată crește." } }))).not.toContain("interzise");
  });

  it("pică condițiile invalide sau cu un număr care nu e în text", () => {
    expect(picate(cu({ conditii: [{ camp: "inventat", op: ">", valoare: 4325 }] }))).toContain("conditii");
    expect(picate(cu({ conditii: [{ camp: "salariu_brut", op: "=>", valoare: 4325 }] }))).toContain("conditii");
    expect(picate(cu({ conditii: [{ camp: "salariu_brut", op: ">", valoare: 7777 }] }))).toContain("conditii_numar");
    expect(picate(cu({ conditii: [{ camp: "varsta", op: ">=", valoare: 4325 }] }))).not.toContain("conditii");
    expect(picate(cu({ conditii: [{ camp: "salariu_brut", op: ">=", valoare: 4325 }] }))).toEqual([]);
  });

  it("pică date care nu sunt ISO și publicat_la lipsă", () => {
    expect(picate(cu({ in_vigoare_de_la: "1 iulie 2026" }))).toContain("date");
    expect(picate(cu({ pana_la: "2026-13-45" }))).toContain("date");
    expect(picate({ ...interp, publicat_la: "" })).toContain("publicat_la");
  });

  it("pică statusul termen_depasit și lipsa titlului în engleză", () => {
    expect(picate(cu({ status: "termen_depasit" }))).toContain("status");
    expect(picate(cu({ rezumat_en: "" }))).toContain("rezumat_en");
  });

  it("un act fără efect financiar trece doar fără schimbări", () => {
    expect(picate({ ...interp, atinge_banii: false })).toContain("triaj");
    expect(verificaInterpretare({ ...interp, atinge_banii: false, schimbari: [] }, TEXT, { azi: AZI }).ok).toBe(true);
  });
});

describe("verificări moi: avertismente și calculabile", () => {
  const rez = (i: InterpretareAct, text = TEXT) => verificaInterpretare(i, text, { azi: AZI });
  const coduri = (v: { cod: string }[]) => v.map((x) => x.cod);

  it("fixtura are formulă: calculabile 1/1, fără avertismente", () => {
    const r = rez(interp);
    expect(r.calculabile).toEqual({ cu_formula: 1, active_cu_bani: 1 });
    expect(r.avertismente).toEqual([]);
    expect(coduri(r.trecute)).toContain("calculabil");
  });

  it("cost sau câștig activ fără formulă: avertisment `calculabil`, `ok` nu se schimbă", () => {
    for (const directie of ["cost", "castig"]) {
      const r = rez(cu({ directie, formula: null, formula_tip: null }));
      expect(coduri(r.avertismente)).toEqual(["calculabil"]);
      expect(r.avertismente[0].schimbare).toBe(0);
      expect(r.calculabile).toEqual({ cu_formula: 0, active_cu_bani: 1 });
      expect(r.picate).toEqual([]);
      expect(r.ok).toBe(true);
    }
  });

  it("`formula` scrisă de mână e destul pentru `calculabil`", () => {
    const r = rez(cu({ formula: "salariu_minim", formula_tip: null }));
    expect(r.calculabile).toEqual({ cu_formula: 1, active_cu_bani: 1 });
    expect(r.avertismente).toEqual([]);
  });

  it("termen și info nu intră în calculabile", () => {
    for (const directie of ["termen", "info"]) {
      const r = rez(cu({ directie, formula: null, formula_tip: null }));
      expect(r.calculabile).toEqual({ cu_formula: 0, active_cu_bani: 0 });
      expect(r.avertismente).toEqual([]);
      expect(coduri([...r.trecute, ...r.picate])).not.toContain("calculabil");
    }
  });

  it("o schimbare expirată nu intră în calculabile; cea care expiră azi încă da", () => {
    const expirata = rez(cu({ pana_la: "2026-10-28", formula: null, formula_tip: null }));
    expect(expirata.calculabile).toEqual({ cu_formula: 0, active_cu_bani: 0 });
    expect(expirata.avertismente).toEqual([]);
    const azi = rez(cu({ pana_la: AZI, formula: null, formula_tip: null }));
    expect(azi.calculabile).toEqual({ cu_formula: 0, active_cu_bani: 1 });
    expect(coduri(azi.avertismente)).toEqual(["calculabil"]);
  });

  it("numără pe mai multe schimbări", () => {
    const s = interp.schimbari[0];
    const i: InterpretareAct = {
      ...interp,
      schimbari: [s, { ...s, formula_tip: null }, { ...s, directie: "info", formula_tip: null }, { ...s, pana_la: "2020-01-01", formula_tip: null }],
    };
    const r = rez(i);
    expect(r.calculabile).toEqual({ cu_formula: 1, active_cu_bani: 2 });
    expect(r.avertismente.map((x) => x.schimbare)).toEqual([1]);
  });

  const necunoscuta = { tip: "schimbare_cota", parametri: { camp: "salariu_brut", cota_veche: null, cota_noua: 4325, perioada: "luna", sursa_veche: null } };
  it("`formula_incompleta`: cota veche lipsește, avertisment fără să pice `ok`", () => {
    const r = rez(cu({ formula_tip: necunoscuta }));
    expect(r.ok).toBe(true);
    expect(r.picate).toEqual([]);
    expect(r.avertismente).toEqual([{ cod: "formula_incompleta", mesaj: "cota veche lipsește: o completează un om cu sursa", schimbare: 0 }]);
    // are formula_tip, deci trece de `calculabil` (completarea o face omul)
    expect(r.calculabile).toEqual({ cu_formula: 1, active_cu_bani: 1 });
  });

  it("o formulă completă nu dă `formula_incompleta`", () => {
    expect(coduri(rez(interp).avertismente)).not.toContain("formula_incompleta");
    expect(coduri(rez(interp).trecute)).toContain("formula_incompleta");
  });

  it("cota veche nulă dar sursa setată pică `formula_tip` (picată, nu avertisment)", () => {
    const r = rez(cu({ formula_tip: { ...necunoscuta, parametri: { ...necunoscuta.parametri, sursa_veche: "x" } } }));
    expect(coduri(r.picate)).toContain("formula_tip");
    expect(r.ok).toBe(false);
  });

  it("acceptă tipurile noi, cu numerele din text, și respinge o referință necunoscută", () => {
    const suma = { tip: "suma_fixa", parametri: { lei: 4325, perioada: "an" } };
    expect(picate(cu({ formula_tip: suma }))).toEqual([]);
    const procent = { tip: "procent_din_camp", parametri: { camp: "salariu_brut", procent: 4325, perioada: "an", peste: 4325 } };
    expect(picate(cu({ formula_tip: procent }))).toEqual([]);
    const multiplu = { tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 4325, procent: 4325, perioada: "an" } };
    expect(picate(cu({ formula_tip: multiplu }))).toEqual([]);
    const rea = { tip: "multiplu_referinta", parametri: { referinta: "inventata", multiplu: 4325, procent: 4325, perioada: "an" } };
    expect(picate(cu({ formula_tip: rea }))).toContain("formula_tip");
  });

  it("valoarea referinței nu se caută în text: multiplu_referinta cere doar multiplul și procentul", () => {
    const cass = { tip: "multiplu_referinta", parametri: { referinta: "salariu_minim_brut", multiplu: 6, procent: 10, perioada: "an" } };
    expect(picate(cu({ formula_tip: cass }), "contribuția: 10% din 6 salarii minime")).not.toContain("formula_tip_text");
    expect(picate(cu({ formula_tip: cass }), "contribuția: 10% din 5 salarii minime")).toContain("formula_tip_text");
  });
});
