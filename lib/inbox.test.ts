import { describe, expect, it } from "vitest";
import { valideazaCatalog } from "./catalog";
import { INBOX, aprobateCaSchimbari, idPropunere, inSchimbare } from "./inbox";
import { potriveste } from "./potrivire";

const act = (cheie: string) => INBOX.acte.find((a) => a.cheie === cheie)!;

describe("inbox-ul din Monitorul Oficial", () => {
  it("vine din rularea reală prin API și are și acte filtrate (fără impact pe bani)", () => {
    expect(INBOX.model).toBe("claude-sonnet-5-5");
    expect(INBOX.acte.some((a) => !a.atinge_banii && a.schimbari.length === 0)).toBe(true);
    expect(INBOX.acte.filter((a) => a.atinge_banii).every((a) => a.schimbari.length > 0)).toBe(true);
  });

  it("fiecare propunere are citatul din act și traducerea în engleză", () => {
    for (const a of INBOX.acte) {
      for (const s of a.schimbari) {
        expect(s.citat.length).toBeGreaterThan(20);
        expect(s.en?.rezumat.length ?? 0).toBeGreaterThan(10);
        expect(s.en?.actiuni.length).toBe(s.actiuni.length);
      }
    }
  });

  it("o propunere aprobată devine un act valid de catalog, cu etichetele alese de om", () => {
    const s = inSchimbare(act("lege-204-2026-aprobare-og-22"), 0, ["rural", "agricultura"], "2026-10-29");
    expect(s.taguri).toEqual(["rural", "agricultura"]);
    expect(s.verificat_la).toBe("2026-10-29");
    expect(s.sursa_url).toMatch(/^https:\/\/legislatie\.just\.ro\/Public\/DetaliiDocument\/\d+$/);
    expect(s.actiuni[0].destinatie).toBe("primaria");
    expect(() => valideazaCatalog([s])).not.toThrow();
  });

  it("apare în fluxul cuiva cu eticheta aprobată, nu și în al altcuiva", () => {
    const aprobate = aprobateCaSchimbari([{ id: idPropunere("oug-29-2026", 0), taguri: ["salariu_minim"], aprobat_la: "2026-10-29" }]);
    const valori = {};
    expect(potriveste({ taguri: ["salariu_minim"], valori }, aprobate, "2026-10-29")).toHaveLength(1);
    expect(potriveste({ taguri: ["pensionar"], valori }, aprobate, "2026-10-29")).toHaveLength(0);
  });

  it("ignoră aprobările pentru propuneri care nu mai sunt în inbox", () => {
    expect(aprobateCaSchimbari([{ id: "mo-nu-exista-0", taguri: ["angajat"], aprobat_la: "2026-10-29" }])).toEqual([]);
  });
});
