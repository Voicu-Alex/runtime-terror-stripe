import { describe, expect, it } from "vitest";
import { gasesteSchimbarea } from "./catalog";
import { GHID } from "./ghid";
import { demoLege, demoProfil } from "./demo-asistent";
import { MESAJ_NEINTELES } from "./asistent";

const profil = (text: string) => demoProfil({ mod: "profil", text, pas: 1, taguri: [] });
const taguri = (text: string) => profil(text).etichete.map((e) => e.tag);

describe("demoProfil", () => {
  it("programator + angajat + SRL cu dividende", () => {
    const r = profil("Sunt programator angajat și am și un SRL din care iau dividende");
    expect(r.etichete.map((e) => e.tag)).toEqual(expect.arrayContaining(["it", "angajat", "srl_dividende"]));
    for (const e of r.etichete) expect(e.din && e.din.length > 0).toBe(true);
  });

  it("chirie, gaz, curent", () => {
    expect(taguri("Stau în chirie, plătesc gaz și curentul")).toEqual(
      expect.arrayContaining(["chirias", "consumator_gaz", "consumator_energie"]),
    );
  });

  it("„sunt salariat” nu dă rural", () => {
    const t = taguri("sunt salariat");
    expect(t).toContain("angajat");
    expect(t).not.toContain("rural");
  });

  it("pilon 2 și 3, mașină fără diacritice", () => {
    expect(taguri("am pilonul 2 si pilon III si o masina")).toEqual(expect.arrayContaining(["pilon2", "pilon3", "masina"]));
  });

  it("nu repetă etichetele din cerere; fără potrivire dă MESAJ_NEINTELES", () => {
    expect(demoProfil({ mod: "profil", text: "sunt salariat", pas: 1, taguri: ["angajat"] }).etichete).toEqual([]);
    expect(profil("nimic de văzut aici").mesaj).toBe(MESAJ_NEINTELES);
  });

  it("mesajul respectă vocea", () => {
    const m = profil("sunt programator și am un copil").mesaj;
    for (const interzis of ["recomand", "garantat", "cel mai bun", "nu-ți face griji", "!"]) expect(m).not.toContain(interzis);
    expect(m).toBe("Am notat: IT, copii. Scoate ce nu e cazul.");
  });
});

describe("demoLege", () => {
  const schimbare = gasesteSchimbarea("pilon2_plata")!;
  const ghid = GHID.find((g) => g.id === "pilon2_plata");
  const cerere = (intrebare: string) => ({
    mod: "lege" as const,
    id: "pilon2_plata",
    profil: { taguri: [], valori: {} },
    istoric: [],
    intrebare,
  });
  const date = { schimbare, ghid };

  it("„De ce mă privește?” conține Legea 2/2026", () => {
    const r = demoLege(cerere("De ce mă privește?"), date);
    expect(r.text).toContain("Legea 2/2026");
    expect(r.sursa?.act).toBe("Legea 2/2026");
  });

  it("cu potrivire, spune ce etichete din profil o fac relevantă", () => {
    const potrivire = {
      schimbare,
      taguri_comune: ["pilon2" as const],
      stare: "sigur" as const,
      impact_lei_luna: null,
      valori_lipsa: [],
      moment: "urmeaza" as const,
      zile_pana_la_termen: null,
    };
    const r = demoLege(cerere("De ce mă privește?"), { ...date, potrivire });
    expect(r.text).toContain("Te privește pentru că ai în profil: Pilon II.");
  });

  it("niciun răspuns nu conține TODO sau „!”", () => {
    for (const q of ["De ce mă privește?", "Ce înseamnă eșalonat?", "Ce se întâmplă dacă nu fac nimic?", "Ce trebuie să fac?"]) {
      const r = demoLege(cerere(q), date);
      expect(r.text).not.toContain("TODO");
      expect(r.text).not.toContain("!");
      expect(r.text.endsWith(".")).toBe(true);
    }
  });

  it("„dacă nu fac nimic” folosește pașii din ghid", () => {
    expect(demoLege(cerere("Ce se întâmplă dacă nu fac nimic?"), date).text).toContain(ghid!.pasi[0]);
  });
});
