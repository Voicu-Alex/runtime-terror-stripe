import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { potriveste } from "./potrivire";
import { PERSOANE_DEMO } from "./persoane-demo";
import { cuTracking, dupaImpact, vedere, zile } from "./card";

const AZI = "2026-10-28";

function carduri(id: keyof typeof PERSOANE_DEMO) {
  const { profil } = PERSOANE_DEMO[id];
  return potriveste(profil, CATALOG, AZI)
    .sort(dupaImpact)
    .map((p) => vedere(p, profil.valori));
}

describe("vederea cardului", () => {
  it("Andrei: IT e primul (cel mai mare impact), −520 lei/lună la brut 8.000", () => {
    const c = carduri("andrei");
    expect(c[0].id).toBe("it_scutire");
    expect(c[0].suma).toBe(-520);
    expect(c[0].kicker).toBe("Domeniul meu · IT");
  });

  it("gaz: termen 31 mar 2027, 154 de zile, nu e urgent", () => {
    const gaz = carduri("andrei").find((c) => c.id === "gaz_plafon")!;
    expect(gaz.termen).toEqual({ text: "31 mar 2027", zile: 154, urgent: false, depasit: false });
    expect(gaz.stare).toBe("in_vigoare");
  });

  it("dividende: termenul din 2025 a trecut, deci starea e „termen depășit”", () => {
    const d = carduri("andrei").find((c) => c.id === "dividende_16")!;
    expect(d.stare).toBe("termen_depasit");
    expect(d.termen?.depasit).toBe(true);
    expect(d.economieAn).toBe(1440);
  });

  it("Ion: CASS 120 lei/lună pe o pensie de 4.200", () => {
    expect(carduri("ion").find((c) => c.id === "cass_pensii")!.suma).toBe(-120);
  });

  it("Ioana: prima de stabilitate, 0 lei acum, 12.000 lei în primul an dacă face pasul", () => {
    const c = carduri("ioana").find((c) => c.id === "prima_stabilitate")!;
    expect(c.suma).toBe(0);
    expect(c.economieAn).toBe(12000);
    expect(c.kicker).toBe("Situația mea · caut primul loc de muncă");
  });

  it("prima de stabilitate: nu apare la 30 de ani împliniți", () => {
    const profil = { taguri: ["caut_primul_job" as const], valori: { an_nastere: 1996 } };
    expect(potriveste(profil, CATALOG, AZI).some((p) => p.schimbare.id === "prima_stabilitate")).toBe(false);
  });

  it("fără pensie în profil: suma lipsește și cardul cere pensia", () => {
    const p = potriveste({ taguri: ["pensionar"], valori: {} }, CATALOG, AZI);
    const v = vedere(p.find((x) => x.schimbare.id === "cass_pensii")!, {});
    expect(v.suma).toBeNull();
    expect(v.cere).toBe("spune-ne pensia ta");
  });
});

describe("formatare", () => {
  it("zile în română", () => {
    expect([1, 5, 19, 20, 154, 100, 101].map((n) => zile(n))).toEqual([
      "o zi", "5 zile", "19 zile", "20 de zile", "154 de zile", "100 de zile", "101 zile",
    ]);
  });

  it("one-click cu utm_source și utm_campaign", () => {
    expect(cuTracking("https://posf.ro/comparator", "gaz_plafon")).toBe(
      "https://posf.ro/comparator?utm_source=ceinseamna&utm_campaign=gaz_plafon",
    );
  });
});
