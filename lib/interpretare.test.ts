import { describe, expect, it } from "vitest";
import { CATALOG, valideazaCatalog } from "./catalog";
import { GHID, valideazaGhid } from "./ghid";
import { idSchimbare, spreGhid, spreSchimbare, type InterpretareAct } from "./interpretare";
import { act, interp } from "./interpretare.fixtura";

const AZI = "2026-10-29";

describe("idSchimbare", () => {
  it("face un slug ascii cu tema și anul", () => {
    const id = idSchimbare(interp, 0, act);
    expect(id).toMatch(/^[a-z0-9_]+$/);
    expect(id).toBe("salariul_minim_brut_2026");
  });

  it("adaugă _2, _3 când id-ul există deja", () => {
    expect(idSchimbare(interp, 0, act, ["salariul_minim_brut_2026"])).toBe("salariul_minim_brut_2026_2");
    expect(idSchimbare(interp, 0, act, ["salariul_minim_brut_2026", "salariul_minim_brut_2026_2"])).toBe("salariul_minim_brut_2026_3");
  });

  it("scoate diacriticele și cuvintele de legătură", () => {
    const alt: InterpretareAct = {
      ...interp,
      schimbari: [{ ...interp.schimbari[0], rezumat: "Impozitul pe clădiri se reduce în mediul rural", in_vigoare_de_la: "2027-01-01" }],
    };
    expect(idSchimbare(alt, 0, act)).toBe("impozitul_cladiri_reduce_2027");
  });
});

describe("spreSchimbare", () => {
  const s = spreSchimbare(interp, 0, act, { verificat_la: AZI, existente: CATALOG.map((x) => x.id) });

  it("mapează câmpurile din interpretare", () => {
    expect(s.act).toBe("HG 146/2026");
    expect(s.mo_ref).toBe("MO 196 / 13 mar 2026");
    expect(s.publicat_la).toBe("2026-03-13");
    expect(s.in_vigoare_de_la).toBe("2026-07-01");
    expect(s.expira_la).toBeNull();
    expect(s.termen_actiune).toBeNull();
    expect(s.status).toBe("in_vigoare");
    expect(s.directie).toBe("castig");
    expect(s.taguri).toEqual(["angajat", "salariu_minim"]);
    expect(s.rezumat_en).toContain("minimum wage");
    expect(s.formula).toBeNull();
    expect(s.formula_tip).toEqual({ tip: "diferenta_prag", parametri: { camp: "salariu_brut", prag: 4325, perioada: "luna" } });
    expect(s.estimare).toBe(false);
    expect(s.sursa_url).toBe(act.url);
    expect(s.sursa_explicativa).toBe("");
    expect(s.profesionist).toBeNull();
    expect(s.incredere).toBe("ridicata");
    expect(s.verificat_la).toBe(AZI);
  });

  it("păstrează citatul lângă articol, ca să-l vadă revizorul", () => {
    expect(s.articol).toMatch(/^art\. 1 · citat: „se stabilește în bani/);
  });

  it("mapează acțiunile la forma din catalog", () => {
    expect(s.actiuni).toEqual([
      {
        text: expect.stringContaining("fluturașul din iulie 2026"),
        termen: "2026-07-01",
        formula_economie: null,
        one_click: null,
        tip: "verifica",
        cine_aplica: "angajator",
        destinatie: "angajator_hr",
      },
    ]);
  });

  it("trece destinatia_propusa în niveluri.expert, cu „De verificat:”", () => {
    const cu: InterpretareAct = {
      ...interp,
      schimbari: [
        { ...interp.schimbari[0], actiuni: [{ ...interp.schimbari[0].actiuni[0], destinatie: null, destinatie_propusa: "Pagina ITM de sesizări" }] },
      ],
    };
    const r = spreSchimbare(cu, 0, act, { verificat_la: AZI, existente: [] });
    expect(r.niveluri.expert).toContain("De verificat: Pagina ITM de sesizări");
    expect(r.actiuni[0].destinatie).toBeNull();
    expect(r.actiuni[0]).not.toHaveProperty("destinatie_propusa");
  });

  it("estimare e true fără nicio formulă sau când nota vorbește de estimare", () => {
    const fara: InterpretareAct = { ...interp, schimbari: [{ ...interp.schimbari[0], formula_tip: null }] };
    expect(spreSchimbare(fara, 0, act, { verificat_la: AZI, existente: [] }).estimare).toBe(true);
    const nota: InterpretareAct = { ...interp, schimbari: [{ ...interp.schimbari[0], nota: "Cifra e o estimare după media pieței." }] };
    expect(spreSchimbare(nota, 0, act, { verificat_la: AZI, existente: [] }).estimare).toBe(true);
  });

  it("mo_ref și publicat_la din act au prioritate; altfel cele din interpretare", () => {
    const fara = { ...act, mo_ref: null, publicat_la: null };
    const r = spreSchimbare(interp, 0, fara, { verificat_la: AZI, existente: [] });
    expect(r.mo_ref).toBe(interp.mo);
    expect(r.publicat_la).toBe(interp.publicat_la);
  });

  it("pana_la devine expira_la; condițiile și termenul de acțiune trec neschimbate", () => {
    const x: InterpretareAct = {
      ...interp,
      schimbari: [{ ...interp.schimbari[0], pana_la: "2027-12-31", termen_actiune: "2026-12-01", conditii: [{ camp: "salariu_brut", op: ">=", valoare: 4050 }] }],
    };
    const r = spreSchimbare(x, 0, act, { verificat_la: AZI, existente: [] });
    expect(r.expira_la).toBe("2027-12-31");
    expect(r.termen_actiune).toBe("2026-12-01");
    expect(r.conditii).toEqual([{ camp: "salariu_brut", op: ">=", valoare: 4050 }]);
  });

  it("trece valideazaCatalog împreună cu catalogul existent", () => {
    expect(() => valideazaCatalog([...CATALOG, s])).not.toThrow();
  });

  it("id-ul nu se ciocnește cu cele existente", () => {
    const dublu = spreSchimbare(interp, 0, act, { verificat_la: AZI, existente: ["salariul_minim_brut_2026"] });
    expect(dublu.id).toBe("salariul_minim_brut_2026_2");
  });

  it("aruncă pentru un indice care nu există", () => {
    expect(() => spreSchimbare(interp, 3, act, { verificat_la: AZI, existente: [] })).toThrow(/nu există/);
  });
});

describe("spreGhid", () => {
  const s = spreSchimbare(interp, 0, act, { verificat_la: AZI, existente: CATALOG.map((x) => x.id) });
  const g = spreGhid(s, interp, 0);

  it("mapează etichetele, rezumatul și pașii; nota modelului nu ajunge în ghid", () => {
    expect(g.id).toBe(s.id);
    expect(g.pentru).toContain("salariu");
    expect(g.pentru).toContain("pe salariul minim");
    expect(g.ce).toBe(s.rezumat);
    expect(g.salvezi).toBeNull();
    expect(g.pierzi).toBeNull();
    expect(g.solutie).toBeNull();
    expect(g.termen).toBeNull();
    expect(g.pasi).toEqual(s.actiuni.map((a) => a.text));
    expect(g.nota).toBeUndefined();
  });

  it("fără acțiuni, pasul e niveluri.zero (niciodată „nimic de făcut”)", () => {
    const fara = { ...s, actiuni: [] };
    expect(spreGhid(fara, interp, 0).pasi).toEqual([s.niveluri.zero]);
  });

  it("trece valideazaGhid împreună cu ghidul existent", () => {
    expect(() => valideazaGhid([...GHID, g], valideazaCatalog([...CATALOG, s]))).not.toThrow();
  });

  it("termenul ghidului e termen_actiune", () => {
    expect(spreGhid({ ...s, termen_actiune: "2026-12-01" }, interp, 0).termen).toBe("2026-12-01");
  });
});
