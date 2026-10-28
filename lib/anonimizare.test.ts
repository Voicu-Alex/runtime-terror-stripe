import { describe, expect, it } from "vitest";
import { mascheaza, mascheazaText } from "./anonimizare";

describe("mascheazaText", () => {
  it("ascunde CNP-ul și IBAN-ul, dar lasă sumele", () => {
    const t = "CNP 1850101123456, IBAN RO49AAAA1B31007593840000, salariu 7500 lei";
    expect(mascheazaText(t)).toBe("CNP [CNP], IBAN [IBAN], salariu 7500 lei");
  });

  it("nu atinge numere de 13 cifre care încep cu 0 sau numere mai scurte", () => {
    expect(mascheazaText("factura 0000123456789 suma 123456")).toBe("factura 0000123456789 suma 123456");
  });
});

describe("mascheaza", () => {
  it("merge recursiv prin obiecte și liste", () => {
    const o = { a: ["RO49AAAA1B31007593840000"], b: { c: "cnp 2900202123456" }, n: 5 };
    expect(mascheaza(o)).toEqual({ a: ["[IBAN]"], b: { c: "cnp [CNP]" }, n: 5 });
  });
});
