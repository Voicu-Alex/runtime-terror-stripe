import { describe, expect, it } from "vitest";
import { areAcces, completariDinFormular, esteAdmin } from "./admin";

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

describe("completariDinFormular", () => {
  const form = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
  it("citește perechile pentru schimbările alese și ignoră câmpurile goale", () => {
    const r = completariDinFormular(form({ cota_veche_0: "10", sursa_veche_0: " Legea 227/2015, art. 97 ", cota_veche_1: "", sursa_veche_1: "" }), [0, 1]);
    expect(r).toEqual({ completari: { 0: { cota_veche: 10, sursa_veche: "Legea 227/2015, art. 97" } } });
  });
  it("acceptă virgula zecimală și ignoră schimbările nealese", () => {
    expect(completariDinFormular(form({ cota_veche_0: "5,5", sursa_veche_0: "x", cota_veche_2: "9", sursa_veche_2: "y" }), [0]).completari).toEqual({ 0: { cota_veche: 5.5, sursa_veche: "x" } });
  });
  it("cere ambele câmpuri și un număr", () => {
    expect(completariDinFormular(form({ cota_veche_0: "10" }), [0]).eroare).toMatch(/Schimbarea 0/);
    expect(completariDinFormular(form({ sursa_veche_0: "x" }), [0]).eroare).toMatch(/Schimbarea 0/);
    expect(completariDinFormular(form({ cota_veche_0: "abc", sursa_veche_0: "x" }), [0]).eroare).toMatch(/număr/);
  });
});
