import { describe, expect, it } from "vitest";
import { adresaDin, contorNou, inregistreaza, limiteDinEnv, type Limite } from "./limita";

const ORA = 60 * 60 * 1000;
const LIMITE: Limite = { peAdresa: 2, fereastraMs: ORA, peZi: 3 };
const T0 = Date.parse("2026-10-29T10:00:00Z");

describe("limita de folosire", () => {
  it("lasă o adresă până la limită, apoi o oprește până iese prima cerere din fereastră", () => {
    const c = contorNou();
    expect(inregistreaza(c, "a", LIMITE, T0).permis).toBe(true);
    expect(inregistreaza(c, "a", LIMITE, T0 + 1000).permis).toBe(true);
    const oprit = inregistreaza(c, "a", LIMITE, T0 + 2000);
    expect(oprit).toEqual({ permis: false, motiv: "adresa", reincearcaInSec: 3598 });
    expect(inregistreaza(c, "a", LIMITE, T0 + ORA).permis).toBe(true);
  });

  it("o cerere oprită nu se numără", () => {
    const c = contorNou();
    inregistreaza(c, "a", LIMITE, T0);
    inregistreaza(c, "a", LIMITE, T0);
    inregistreaza(c, "a", LIMITE, T0);
    expect(c.total).toBe(2);
  });

  it("oprește pe toată lumea după limita zilnică și pornește din nou a doua zi (UTC)", () => {
    const c = contorNou();
    for (const a of ["a", "b", "c"]) expect(inregistreaza(c, a, LIMITE, T0).permis).toBe(true);
    const oprit = inregistreaza(c, "d", LIMITE, T0);
    expect(oprit).toEqual({ permis: false, motiv: "zi", reincearcaInSec: 14 * 3600 });
    expect(inregistreaza(c, "d", LIMITE, Date.parse("2026-10-30T00:00:01Z")).permis).toBe(true);
  });

  it("citește limitele din mediu, cu valori implicite pentru lipsă sau text greșit", () => {
    expect(limiteDinEnv({})).toEqual({ peAdresa: 5, fereastraMs: ORA, peZi: 150 });
    expect(limiteDinEnv({ LIMITA_DOCUMENTE_PE_ORA: "10", LIMITA_DOCUMENTE_PE_ZI: "0" })).toMatchObject({ peAdresa: 10, peZi: 0 });
    expect(limiteDinEnv({ LIMITA_DOCUMENTE_PE_ORA: "multe", LIMITA_DOCUMENTE_PE_ZI: "-1" })).toMatchObject({ peAdresa: 5, peZi: 150 });
  });

  it("ia prima adresă din x-forwarded-for", () => {
    expect(adresaDin(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(adresaDin(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(adresaDin(new Headers())).toBe("necunoscut");
  });
});
