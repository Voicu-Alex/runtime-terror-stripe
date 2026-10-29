import { describe, expect, it } from "vitest";
import { FREEMIUM_GOL, areAcces, deblocariRamase, deblocheaza } from "./freemium";

describe("freemium (ADR 0003, 0004)", () => {
  it("ai o deblocare de la început și încă una după ce completezi profilul", () => {
    expect(deblocariRamase(FREEMIUM_GOL, false)).toBe(1);
    expect(deblocariRamase(FREEMIUM_GOL, true)).toBe(2);
  });

  it("o deblocare deschide actul și scade numărul de deblocări", () => {
    const s = deblocheaza(FREEMIUM_GOL, "tva_21", false);
    expect(areAcces(s, "tva_21", false)).toBe(true);
    expect(areAcces(s, "dividende_16", false)).toBe(false);
    expect(deblocariRamase(s, false)).toBe(0);
  });

  it("fără deblocări rămase nu se mai deschide nimic; recompensa pentru profil mai dă una", () => {
    const s = deblocheaza(FREEMIUM_GOL, "tva_21", false);
    expect(deblocheaza(s, "dividende_16", false)).toBe(s);
    expect(areAcces(deblocheaza(s, "dividende_16", true), "dividende_16", false)).toBe(true);
  });

  it("același act nu consumă două deblocări", () => {
    const s = deblocheaza(FREEMIUM_GOL, "tva_21", true);
    expect(deblocheaza(s, "tva_21", true)).toBe(s);
    expect(deblocariRamase(s, true)).toBe(1);
  });

  it("Pro deschide tot", () => {
    expect(areAcces(FREEMIUM_GOL, "orice", true)).toBe(true);
  });
});
