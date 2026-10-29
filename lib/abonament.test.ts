import { describe, expect, it } from "vitest";
import { FARA_ABONAMENT, MONEDA, PRET_BANI, esteActiv, fluxDeschis } from "./abonament";

describe("abonamentul", () => {
  it("costă 15 lei pe lună, în bani", () => {
    expect(PRET_BANI).toBe(1500);
    expect(MONEDA).toBe("ron");
  });

  it("dă acces doar când e plătit sau în probă", () => {
    expect(esteActiv("active")).toBe(true);
    expect(esteActiv("trialing")).toBe(true);
    for (const s of ["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused", null, undefined]) {
      expect(esteActiv(s)).toBe(false);
    }
  });

  it("deschide fluxul doar cu Pro, altfel îl estompează", () => {
    expect(fluxDeschis(null)).toBe(false);
    expect(fluxDeschis(FARA_ABONAMENT)).toBe(false);
    expect(fluxDeschis({ ...FARA_ABONAMENT, conectat: true, activ: true, status: "active" })).toBe(true);
    expect(fluxDeschis({ ...FARA_ABONAMENT, conectat: true, activ: false, status: "canceled" })).toBe(false);
  });
});
