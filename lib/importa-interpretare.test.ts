import { describe, expect, it } from "vitest";
import { liniiVerificare, STARI_ASTEAPTA, STARI_REINTERPRETARE, textCalculabile, urcaInterpretare, pregatesteRand } from "./importa-interpretare";
import { act, interp } from "./interpretare.fixtura";
import { verificaInterpretare } from "./verificari-interpretare";

const AZI = "2026-10-29";

describe("liniiVerificare", () => {
  it("prima linie se termină cu calculabile X/Y", () => {
    const v = verificaInterpretare(interp, act.text ?? "", { azi: AZI });
    const [prima, ...rest] = liniiVerificare("portal_308231", interp, v);
    expect(prima).toMatch(/^✓ portal_308231: atinge banii, 1 schimbări, verificări ok \(\d+\) · calculabile 1\/1$/);
    expect(rest).toEqual([]);
  });

  it("cu verificări picate: linia cu calculabile și câte o linie pe verificare picată", () => {
    const fara = { ...interp, schimbari: [{ ...interp.schimbari[0], formula_tip: null, citat: "inventat de model, negăsit în text" }] };
    const v = verificaInterpretare(fara, act.text ?? "", { azi: AZI });
    const [prima, ...rest] = liniiVerificare("portal_308231", fara, v);
    expect(prima).toMatch(/^! portal_308231: .*1 verificări picate: citat#0 · calculabile 0\/1$/);
    expect(rest).toHaveLength(1);
  });

  it("textCalculabile", () => {
    expect(textCalculabile({ cu_formula: 14, active_cu_bani: 49 })).toBe("calculabile 14 din 49 schimbări active cu bani");
  });
});

describe("urcaInterpretare cu lista de stări", () => {
  const rand = pregatesteRand({ actId: "portal:1", model: "m", driver: "api", versiune: "v4", interpretare: interp, text: act.text ?? "", azi: AZI }).rand;
  const client = (jurnal: unknown[]) => ({
    from: (t: string) => ({
      upsert: async () => ({ data: null, error: null }),
      update: () => ({
        eq: () => ({
          in: (_c: string, l: string[]) => ({ select: async () => (jurnal.push([t, l]), { data: [{ id: "portal:1" }], error: null }) }),
        }),
      }),
    }),
  });

  it("implicit cele trei stări de așteptare, niciodată aprobat sau respins", async () => {
    const jurnal: unknown[] = [];
    await urcaInterpretare(client(jurnal), rand, "portal:1");
    expect(jurnal).toEqual([["acte", STARI_ASTEAPTA]]);
    expect(STARI_REINTERPRETARE).toEqual([...STARI_ASTEAPTA, "interpretat"]);
    expect(STARI_REINTERPRETARE).not.toContain("aprobat");
    expect(STARI_REINTERPRETARE).not.toContain("respins");
  });

  it("cu `stari` primește lista mai largă", async () => {
    const jurnal: unknown[] = [];
    const rez = await urcaInterpretare(client(jurnal), rand, "portal:1", undefined, STARI_REINTERPRETARE);
    expect(rez).toEqual({ urcat: true });
    expect(jurnal).toEqual([["acte", ["candidat", "triat_da", "nou", "interpretat"]]]);
  });
});
