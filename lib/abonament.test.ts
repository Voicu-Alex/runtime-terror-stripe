import { describe, expect, it } from "vitest";
import { MONEDA, PRET_BANI, esteActiv } from "./abonament";

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
});
