import { describe, expect, it } from "vitest";
import { argumentePas, calculeazaInterval, claseazaIesire, formateazaDelta, IMPLICITE, numaraStari, opresteRularea, STARI_PROCESARE, tabelDelta } from "./zilnic";

describe("calculeazaInterval", () => {
  it("cu cursor: pana_la = cursor + pas, de_la rămâne la --reia", () => {
    expect(calculeazaInterval({ cursor: 315000, pasIds: 400, dryRun: false })).toEqual({ deLa: null, panaLa: 315400 });
  });
  it("dry-run cere --de-la și are exact pas id-uri", () => {
    expect(calculeazaInterval({ cursor: null, pasIds: 6, deLa: 315770, dryRun: true })).toEqual({ deLa: 315770, panaLa: 315775 });
    expect(() => calculeazaInterval({ cursor: null, pasIds: 6, dryRun: true })).toThrow(/--de-la/);
  });
  it("dry-run ignoră cursorul", () => {
    expect(calculeazaInterval({ cursor: 1, pasIds: 2, deLa: 10, dryRun: true })).toEqual({ deLa: 10, panaLa: 11 });
  });
  it("fără cursor și fără dry-run cere --de-la; cu --de-la pornește de acolo", () => {
    expect(() => calculeazaInterval({ cursor: null, pasIds: 5, dryRun: false })).toThrow(/cursor/);
    expect(calculeazaInterval({ cursor: null, pasIds: 5, deLa: 100, dryRun: false })).toEqual({ deLa: 100, panaLa: 104 });
  });
  it("respinge pas invalid", () => {
    expect(() => calculeazaInterval({ cursor: 1, pasIds: 0, dryRun: false })).toThrow();
  });
});

describe("argumentePas", () => {
  const live = { deLa: null, panaLa: 315400 };
  it("descopera cu cursor folosește --reia", () => {
    expect(argumentePas("descopera", IMPLICITE, live)).toEqual(["--reia", "--pana-la", "315400", "--max", "400"]);
  });
  it("descopera în dry-run înlocuiește --reia cu --de-la/--pana-la", () => {
    const o = { ...IMPLICITE, dryRun: true, maxCereri: 5 };
    expect(argumentePas("descopera", o, { deLa: 10, panaLa: 14 })).toEqual(["--de-la", "10", "--pana-la", "14", "--max", "5", "--dry-run"]);
  });
  it("triaj și interpreteaza", () => {
    expect(argumentePas("triaj", IMPLICITE, live)).toEqual(["--api", "--max", "100"]);
    expect(argumentePas("interpreteaza", IMPLICITE, live)).toEqual(["--stare", "triat_da", "--max", "20", "--buget-usd", "2"]);
    expect(argumentePas("interpreteaza", { ...IMPLICITE, dryRun: true }, live).at(-1)).toBe("--dry-run");
    expect(argumentePas("triaj", { ...IMPLICITE, dryRun: true }, live).at(-1)).toBe("--dry-run");
  });
});

describe("claseazaIesire", () => {
  it("clasifică codurile", () => {
    expect(claseazaIesire("descopera", 0)).toBe("ok");
    expect(claseazaIesire("descopera", 2)).toBe("oprit_portal");
    expect(claseazaIesire("interpreteaza", 2)).toBe("buget");
    expect(claseazaIesire("triaj", 2)).toBe("eroare");
    expect(claseazaIesire("triaj", 1)).toBe("eroare");
    expect(claseazaIesire("triaj", null)).toBe("eroare");
  });
  it("bugetul nu oprește rularea, portalul blocat și eroarea da", () => {
    expect(opresteRularea("buget")).toBe(false);
    expect(opresteRularea("ok")).toBe(false);
    expect(opresteRularea("oprit_portal")).toBe(true);
    expect(opresteRularea("eroare")).toBe(true);
  });
});

describe("tabel de diferențe", () => {
  it("numără stările", () => {
    expect(numaraStari([{ stare_procesare: "nou" }, { stare_procesare: "nou" }, { stare_procesare: "candidat" }])).toEqual({ nou: 2, candidat: 1 });
  });
  it("lista stărilor e cea din constrângerea bazei și intră în tabel chiar la zero", () => {
    expect([...STARI_PROCESARE]).toEqual(["nou", "respins_reguli", "candidat", "triat_nu", "triat_da", "interpretat", "aprobat", "respins", "eroare"]);
    const zero = Object.fromEntries(STARI_PROCESARE.map((s) => [s, 0]));
    const t = tabelDelta(zero, { ...zero, candidat: 4, nou: 2 });
    expect(t).toHaveLength(STARI_PROCESARE.length);
    expect(t.find((r) => r.stare === "candidat")).toEqual({ stare: "candidat", inainte: 0, dupa: 4, delta: 4 });
    expect(t.find((r) => r.stare === "aprobat")).toEqual({ stare: "aprobat", inainte: 0, dupa: 0, delta: 0 });
  });
  it("uniune de stări, diferențe cu semn", () => {
    const t = tabelDelta({ candidat: 5, nou: 1 }, { candidat: 2, interpretat: 3, nou: 1 });
    expect(t).toEqual([
      { stare: "candidat", inainte: 5, dupa: 2, delta: -3 },
      { stare: "interpretat", inainte: 0, dupa: 3, delta: 3 },
      { stare: "nou", inainte: 1, dupa: 1, delta: 0 },
    ]);
    const text = formateazaDelta(t);
    expect(text).toContain("+3");
    expect(text).toContain("-3");
    expect(formateazaDelta([])).toMatch(/niciun act/);
  });
});
