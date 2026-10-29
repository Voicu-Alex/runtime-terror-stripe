import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LIMITA_TEXT_INTEGRAL, textPentruModel } from "./lot";
import { parseazaPaginaAct } from "./portal";

const act = (id: string) => {
  const a = parseazaPaginaAct(readFileSync(join(__dirname, "fixtures", "portal", `${id}.html`), "utf8"), id);
  if (!a) throw new Error(`fixtura ${id} nu s-a parsat`);
  return { id: `portal:${id}`, ...a };
};

describe("textPentruModel", () => {
  it("act scurt: antet + tot textul, fără avertisment", () => {
    const a = act("315641");
    const t = textPentruModel(a);
    expect(t.antet).toBe(`${a.titlu.replace(/\s+/g, " ").trim()}\n${a.url}\nPublicat în: MO 886 / 22 oct 2026 (2026-10-22)\nData intrării în vigoare (Portal): necunoscută\n\n`);
    expect(t.corp).toBe(a.text);
    expect(t.text).toBe(`${t.antet}${a.text}\n`);
    expect(t.articoleCerute).toEqual([]);
    expect(t.avertisment).toBeUndefined();
  });

  it("act lung fără articole cerute: tot textul, cu avertisment", () => {
    const a = { id: "portal:1", titlu: "LEGE", url: "u", text: "x".repeat(LIMITA_TEXT_INTEGRAL + 1) };
    const t = textPentruModel(a);
    expect(t.corp).toHaveLength(LIMITA_TEXT_INTEGRAL + 1);
    expect(t.avertisment).toMatch(/peste 120000/);
    expect(textPentruModel({ ...a, text: "x".repeat(LIMITA_TEXT_INTEGRAL) }).avertisment).toBeUndefined();
  });

  it("articole cerute: doar ele, cu însoțitorul de la final", () => {
    const a = act("315641");
    const nr = a.articole[0].nr.replace(/^art\.\s*/i, "");
    const t = textPentruModel({ ...a, triaj: { articole_cerute: [nr] } });
    expect(t.corp.startsWith(`Art. ${nr}\n`)).toBe(true);
    expect(t.corp.endsWith(`Textul primit conține doar articolele: ${nr}`)).toBe(true);
    expect(t.avertisment).toBeUndefined();
  });

  it("articol negăsit: avertisment, însoțitorul îl omite", () => {
    const a = act("315641");
    const t = textPentruModel({ ...a, triaj: { articole_cerute: ["999"] } });
    expect(t.avertisment).toBe("articole negăsite: 999");
    expect(t.corp.endsWith("doar articolele: ")).toBe(true);
  });
});
