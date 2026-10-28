import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { alegeNotificarea } from "./plan";
import { potriveste } from "./potrivire";
import { PERSOANE_DEMO } from "./persoane-demo";

const AZI = "2026-10-28";

describe("alegeNotificarea", () => {
  it("fără potriviri dă null", () => {
    expect(alegeNotificarea([])).toBeNull();
  });

  it("preferă actul cu termenul cel mai apropiat în viitor", () => {
    const p = potriveste(PERSOANE_DEMO.maria.profil, CATALOG, AZI);
    const ales = alegeNotificarea(p)!;
    const viitoare = p.filter((x) => x.zile_pana_la_termen !== null && x.zile_pana_la_termen >= 0);
    expect(viitoare.length).toBeGreaterThan(0);
    expect(ales.zile_pana_la_termen).toBe(Math.min(...viitoare.map((x) => x.zile_pana_la_termen!)));
  });

  it("fără termene viitoare, ia impactul cel mai mare în modul", () => {
    const p = potriveste(PERSOANE_DEMO.ion.profil, CATALOG, AZI).map((x) => ({ ...x, zile_pana_la_termen: null }));
    const ales = alegeNotificarea(p)!;
    const max = Math.max(...p.map((x) => Math.abs(x.impact_lei_luna ?? 0)));
    expect(Math.abs(ales.impact_lei_luna ?? 0)).toBe(max);
  });
});
