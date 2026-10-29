import { describe, expect, it } from "vitest";
import { areAcces, esteAdmin } from "./admin";

describe("esteAdmin", () => {
  it("găsește adresa în listă, fără să conteze majusculele și spațiile", () => {
    expect(esteAdmin("Andrei@Exemplu.ro", " ion@x.ro , andrei@exemplu.ro ")).toBe(true);
  });
  it("respinge adresa care nu e în listă", () => {
    expect(esteAdmin("alt@x.ro", "ion@x.ro,maria@x.ro")).toBe(false);
  });
  it("respinge când lipsește emailul sau lista", () => {
    expect(esteAdmin(undefined, "ion@x.ro")).toBe(false);
    expect(esteAdmin("ion@x.ro", "")).toBe(false);
    expect(esteAdmin("ion@x.ro", undefined)).toBe(false);
  });
  it("nu potrivește pe bucăți de adresă", () => {
    expect(esteAdmin("ion@x.ro", "ion@x.ro.evil.com")).toBe(false);
  });
});

describe("areAcces", () => {
  it("fără listă: deschis în dezvoltare, închis în producție", () => {
    expect(areAcces(null, "", false)).toBe(true);
    expect(areAcces(null, undefined, true)).toBe(false);
  });
  it("cu listă: doar adresele din ea, și în dezvoltare", () => {
    expect(areAcces(null, "ion@x.ro", false)).toBe(false);
    expect(areAcces("ion@x.ro", "ion@x.ro", true)).toBe(true);
  });
});
