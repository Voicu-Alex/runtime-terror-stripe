import { describe, expect, it } from "vitest";
import { dataScurta, zile } from "./card";
import { CATALOG } from "./catalog";
import { etichetaTagL, familieL, traduce } from "./i18n";
import { FAMILII, TOATE_TAGURILE, type Familie } from "./taguri";

describe("interfața în engleză", () => {
  it("în română textul rămâne neschimbat", () => {
    expect(traduce("ro", "Fluxul meu")).toBe("Fluxul meu");
  });

  it("ce e în dicționar se traduce, ce nu e rămâne în română (nu inventăm)", () => {
    expect(traduce("en", "Fluxul meu")).toBe("My feed");
    expect(traduce("en", "text fără traducere")).toBe("text fără traducere");
  });

  it("fiecare etichetă și familie are nume în engleză", () => {
    for (const t of TOATE_TAGURILE) expect(etichetaTagL("en", t).length).toBeGreaterThan(1);
    for (const f of Object.keys(FAMILII) as Familie[]) expect(familieL("en", f)).not.toBe(FAMILII[f]);
  });

  it("fiecare act din catalog are titlu în engleză", () => {
    for (const s of CATALOG) expect(s.rezumat_en?.length ?? 0).toBeGreaterThan(10);
  });

  it("datele și zilele se formatează în engleză", () => {
    expect(dataScurta("2026-03-26", "en")).toBe("26 Mar 2026");
    expect(dataScurta("2026-03-26")).toBe("26 mar 2026");
    expect(zile(1, "en")).toBe("one day");
    expect(zile(21, "en")).toBe("21 days");
    expect(zile(21)).toBe("21 de zile");
  });
});
