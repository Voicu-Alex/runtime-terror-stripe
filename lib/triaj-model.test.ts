import { describe, expect, it } from "vitest";
import { construiesteLot, costTriajUsd, INSTRUCTIUNI_TRIAJ, parseazaVerdicte, verdictInTriaj } from "./triaj-model";

const act = (id: string, text = "Text scurt.") => ({
  id,
  titlu: "  LEGE nr. 1\n din 2026 ",
  tip_act: "LEGE",
  emitent: null,
  mo_ref: "MO 1 / 2 ian 2026",
  text,
  triaj: { reguli: { motive: ["tip LEGE", "impozit"] } },
});

describe("construiesteLot", () => {
  it("scrie antetul, motivele și textul", () => {
    const linii = construiesteLot([act("portal:1")]).split("\n");
    expect(linii[0]).toBe("## portal:1");
    expect(linii[2]).toBe("**LEGE nr. 1 din 2026**");
    expect(linii[3]).toBe("Tip: LEGE · Emitent: ? · MO 1 / 2 ian 2026");
    expect(linii[4]).toBe("Motivele regulilor: tip LEGE; impozit");
    expect(linii[6]).toBe("Text scurt.");
  });
  it("taie textul lung și desparte actele cu ---", () => {
    const lot = construiesteLot([act("a", "x".repeat(50)), act("b")], 10);
    expect(lot).toContain(`${"x".repeat(10)}\n[…text tăiat…]\n`);
    expect(lot).not.toContain("x".repeat(11));
    expect(lot).toContain("\n---\n\n## b");
    expect(construiesteLot([act("b")])).not.toContain("tăiat");
  });
});

describe("parseazaVerdicte", () => {
  const ok = { atinge_banii: true, motiv: "Schimbă o taxă." };
  it("citește JSON din bloc json", () => {
    const r = parseazaVerdicte("Iată:\n```json\n" + JSON.stringify({ a: ok, b: { atinge_banii: false, motiv: "Numire." } }) + "\n```", ["a", "b"]);
    expect(r.verdicte.a).toEqual(ok);
    expect(r.verdicte.b.atinge_banii).toBe(false);
    expect(r.lipsa).toEqual([]);
    expect(r.invalide).toEqual([]);
  });
  it("citește JSON cu text în jurul acoladelor", () => {
    expect(parseazaVerdicte(`Răspuns: ${JSON.stringify({ a: ok })} gata.`, ["a"]).verdicte.a).toEqual(ok);
  });
  it("raportează id lipsă și cheie în plus", () => {
    const r = parseazaVerdicte(JSON.stringify({ a: ok, zzz: ok }), ["a", "b"]);
    expect(r.lipsa).toEqual(["b"]);
    expect(r.invalide).toEqual(["zzz"]);
    expect(r.verdicte.zzz).toBeUndefined();
  });
  it("respinge valori invalide", () => {
    const r = parseazaVerdicte(JSON.stringify({ a: { atinge_banii: "da", motiv: "x" }, b: { atinge_banii: true, motiv: "  " }, c: null }), ["a", "b", "c"]);
    expect(r.invalide.sort()).toEqual(["a", "b", "c"]);
    expect(r.verdicte).toEqual({});
    expect(r.lipsa).toEqual([]);
  });
  it("răspuns fără JSON: toate lipsesc", () => {
    expect(parseazaVerdicte("nu pot", ["a"])).toEqual({ verdicte: {}, lipsa: ["a"], invalide: [] });
  });
});

describe("costTriajUsd", () => {
  it("calculează cu prețurile Haiku și Sonnet", () => {
    const u = { input_tokens: 1e6, output_tokens: 1e6, cache_creation_input_tokens: 1e6, cache_read_input_tokens: 1e6 };
    expect(costTriajUsd(u, "claude-haiku-5-5")).toBeCloseTo(0.1 + 0.5 + 0.125 + 0.01, 6);
    expect(costTriajUsd(u, "claude-sonnet-5-5")).toBeCloseTo(2 + 10 + 2.5 + 0.2, 6);
    expect(costTriajUsd({}, "claude-haiku-5-5")).toBe(0);
  });
  it("aruncă pentru model necunoscut", () => {
    expect(() => costTriajUsd({}, "x")).toThrow();
  });
});

describe("verdictInTriaj", () => {
  it("păstrează triajul vechi și trece starea", () => {
    const da = verdictInTriaj({ reguli: { candidat: true } }, { atinge_banii: true, motiv: "m" }, "claude-haiku-5-5", "2026-10-29");
    expect(da.stare_procesare).toBe("triat_da");
    expect(da.triaj).toEqual({ reguli: { candidat: true }, model: { atinge_banii: true, motiv: "m", model: "claude-haiku-5-5", la: "2026-10-29" } });
    expect(verdictInTriaj(null, { atinge_banii: false, motiv: "m" }, "x", "2026-10-29").stare_procesare).toBe("triat_nu");
  });
});

describe("INSTRUCTIUNI_TRIAJ", () => {
  it("cere JSON pe id și text tăiat spre true", () => {
    expect(INSTRUCTIUNI_TRIAJ).toContain("[…text tăiat…]");
    expect(INSTRUCTIUNI_TRIAJ).toContain("atinge_banii");
  });
});
