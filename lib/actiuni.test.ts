import { describe, expect, it } from "vitest";
import { CATALOG, CatalogInvalid, valideazaCatalog } from "./catalog";
import { DESTINATII } from "./destinatii";
import { PERSOANE_DEMO } from "./persoane-demo";
import { potriveste } from "./potrivire";

const AZI = "2026-10-28";
const baza = CATALOG.find((s) => s.id === "dividende_16")!;
const cu = (actiune: object) => [{ ...baza, actiuni: [{ ...baza.actiuni[0], ...actiune }] }];

describe("salariul minim (HG 146/2026) cu formula parametrizată", () => {
  const { profil } = PERSOANE_DEMO.elena;

  it("Elena primește cardul, dar fără brut suma lipsește și cardul cere salariul brut", () => {
    const p = potriveste(profil, CATALOG, AZI).find((x) => x.schimbare.id === "salariu_minim_2026")!;
    expect(p.impact_lei_luna).toBeNull();
    expect(p.valori_lipsa).toContain("salariu_brut");
  });

  it("după ce spune 4.050 lei brut: +275 lei/lună", () => {
    const p = potriveste({ ...profil, valori: { ...profil.valori, salariu_brut: 4050 } }, CATALOG, AZI).find(
      (x) => x.schimbare.id === "salariu_minim_2026",
    )!;
    expect(p.impact_lei_luna).toBe(275);
  });

  it("normă parțială (2.000 lei brut, sub minimul vechi): cardul nu apare, deci nu afișăm +2.325 lei", () => {
    const p = potriveste({ ...profil, valori: { ...profil.valori, salariu_brut: 2000 } }, CATALOG, AZI);
    expect(p.some((x) => x.schimbare.id === "salariu_minim_2026")).toBe(false);
  });

  it("Andrei nu e pe salariul minim, nu primește cardul", () => {
    expect(potriveste(PERSOANE_DEMO.andrei.profil, CATALOG, AZI).some((x) => x.schimbare.id === "salariu_minim_2026")).toBe(false);
  });
});

describe("acțiuni tipizate și destinații", () => {
  it("fiecare acțiune din catalog are tip și cine_aplica, iar destinațiile există", () => {
    for (const s of CATALOG)
      for (const a of s.actiuni) {
        expect(a.tip, s.id).toBeDefined();
        expect(a.cine_aplica, s.id).toBeDefined();
        if (a.destinatie) expect(DESTINATII[a.destinatie], `${s.id} → ${a.destinatie}`).toBeDefined();
      }
  });

  it("validatorul respinge o destinație inventată", () => {
    expect(() => valideazaCatalog(cu({ tip: "fa", destinatie: "anaf_pagina_inventata" }))).toThrow(CatalogInvalid);
  });

  it("validatorul respinge „nimic_pana_la” fără termen și destinație fără tip", () => {
    expect(() => valideazaCatalog(cu({ tip: "nimic_pana_la", termen: null }))).toThrow(/cere un termen/);
    expect(() => valideazaCatalog(cu({ tip: undefined, destinatie: "primaria" }))).toThrow(/cere și tipul/);
  });

  it("destinațiile cu URL au doar adrese https de pe domenii oficiale cunoscute", () => {
    const oficiale = ["posf.ro", "anaf.ro", "cnpp.ro", "inspectiamuncii.ro", "asfromania.ro", "ceccar.ro", "ccfiscali.ro"];
    for (const [id, d] of Object.entries(DESTINATII)) {
      if (!d.url) continue;
      const gazda = new URL(d.url).hostname.replace(/^www\./, "");
      expect(d.url.startsWith("https://"), id).toBe(true);
      expect(oficiale.some((o) => gazda === o || gazda.endsWith(`.${o}`)), id).toBe(true);
    }
  });
});
