import { describe, expect, it } from "vitest";
import { CATALOG, valideazaCatalog, CatalogInvalid, type Schimbare } from "./catalog";
import { evalueazaConditia, momentul, planulMeu, potriveste } from "./potrivire";
import { adaugaInProfil, normalizeaza, PROFIL_GOL, type Profil } from "./profil";
import { TOATE_TAGURILE } from "./taguri";

const AZI = "2026-10-28";

const profil = (p: Partial<Profil>): Profil => ({ ...PROFIL_GOL, ...p });

describe("catalogul", () => {
  it("se încarcă și fiecare intrare folosește etichete și formule care există", () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(7);
    for (const s of CATALOG) {
      expect(s.taguri.every((t) => TOATE_TAGURILE.includes(t))).toBe(true);
      expect(s.sursa_url.startsWith("https://")).toBe(true);
      expect(s.niveluri.zero.length).toBeGreaterThan(10);
    }
  });

  it("conține cele 7 acte din demo", () => {
    const ids = CATALOG.map((s) => s.id);
    for (const id of ["energie_plafon", "tva_21", "cass_pensii", "dividende_16", "micro_1", "pilon2_plata", "gaz_plafon"]) {
      expect(ids).toContain(id);
    }
  });

  it("respinge o etichetă necunoscută", () => {
    const rau = [{ ...CATALOG[0], id: "x", taguri: ["inexistent"] }];
    expect(() => valideazaCatalog(rau)).toThrow(CatalogInvalid);
  });

  it("respinge o formulă necunoscută", () => {
    const rau = [{ ...CATALOG[0], id: "x", formula: "nu_exista" }];
    expect(() => valideazaCatalog(rau)).toThrow(CatalogInvalid);
  });
});

describe("potriveste", () => {
  it("fără etichete comune nu întoarce nimic", () => {
    expect(potriveste(profil({ taguri: ["masina"] }), CATALOG, AZI)).toEqual([]);
  });

  it("pensionar cu pensia sub 3.000 lei: CASS nu îl atinge", () => {
    const r = potriveste(profil({ taguri: ["pensionar"], valori: { pensie_lunara: 2500 } }), CATALOG, AZI);
    expect(r.map((p) => p.schimbare.id)).not.toContain("cass_pensii");
    expect(r.map((p) => p.schimbare.id)).toContain("tva_21");
  });

  it("pensionar fără pensia completată: CASS e „posibil”, fără sumă, și cere pensia", () => {
    const r = potriveste(profil({ taguri: ["pensionar"] }), CATALOG, AZI);
    const cass = r.find((p) => p.schimbare.id === "cass_pensii")!;
    expect(cass.stare).toBe("posibil");
    expect(cass.impact_lei_luna).toBeNull();
    expect(cass.valori_lipsa).toContain("pensie_lunara");
  });

  it("pensionar cu 4.200 lei: CASS e sigur și costă 120 lei/lună", () => {
    const r = potriveste(profil({ taguri: ["pensionar"], valori: { pensie_lunara: 4200 } }), CATALOG, AZI);
    const cass = r.find((p) => p.schimbare.id === "cass_pensii")!;
    expect(cass.stare).toBe("sigur");
    expect(cass.impact_lei_luna).toBe(-120);
    expect(cass.taguri_comune).toEqual(["pensionar"]);
  });

  it("dividende de 24.000 lei/an: 6 puncte în plus înseamnă 120 lei/lună", () => {
    const r = potriveste(profil({ taguri: ["srl_dividende"], valori: { dividende_anuale: 24000 } }), CATALOG, AZI);
    expect(r.find((p) => p.schimbare.id === "dividende_16")!.impact_lei_luna).toBe(-120);
  });

  it("angajat IT cu 12.000 brut: scutirea pierdută costă 650 lei/lună (cifra din mockup)", () => {
    const r = potriveste(profil({ taguri: ["it"], valori: { salariu_brut: 12000 } }), CATALOG, AZI);
    expect(r.find((p) => p.schimbare.id === "it_scutire")!.impact_lei_luna).toBe(-650);
  });

  it("formulă fără valoare: impact null și valoarea cerută", () => {
    const r = potriveste(profil({ taguri: ["angajat"] }), CATALOG, AZI);
    const tva = r.find((p) => p.schimbare.id === "tva_21")!;
    expect(tva.impact_lei_luna).toBeNull();
    expect(tva.valori_lipsa).toEqual(["cheltuieli_lunare"]);
  });

  it("sortează cronologic și marchează momentul", () => {
    const r = potriveste(profil({ taguri: ["pilon2", "consumator_energie", "consumator_gaz"] }), CATALOG, AZI);
    const date = r.map((p) => p.schimbare.in_vigoare_de_la);
    expect([...date].sort()).toEqual(date);
    expect(r.find((p) => p.schimbare.id === "pilon2_plata")!.moment).toBe("urmeaza");
    expect(r.find((p) => p.schimbare.id === "energie_plafon")!.moment).toBe("in_vigoare");
  });

  it("numără zilele până la termen", () => {
    const r = potriveste(profil({ taguri: ["pilon3"] }), CATALOG, AZI);
    expect(r.find((p) => p.schimbare.id === "pilon3_deducere")!.zile_pana_la_termen).toBe(64);
  });
});

describe("planulMeu", () => {
  it("adună impacturile și economiile din acțiunile bifate", () => {
    const p = profil({ taguri: ["srl_dividende", "pilon3"], valori: { dividende_anuale: 24000 } });
    const r = potriveste(p, CATALOG, AZI);
    const fara = planulMeu(r, new Set(), p.valori);
    expect(fara.fara_actiuni).toBe(-120);
    expect(fara.economii).toBe(0);
    const cu = planulMeu(r, new Set(["pilon3_deducere"]), p.valori);
    expect(cu.economii).toBeCloseTo(16.67, 1);
    expect(cu.cu_actiuni).toBeCloseTo(-103.33, 1);
  });
});

describe("evalueazaConditia și momentul", () => {
  it("evaluează operatorii", () => {
    expect(evalueazaConditia({ camp: "pensie_lunara", op: ">=", valoare: 3000 }, { pensie_lunara: 3000 })).toBe("adevarat");
    expect(evalueazaConditia({ camp: "pensie_lunara", op: "<", valoare: 3000 }, { pensie_lunara: 3000 })).toBe("fals");
    expect(evalueazaConditia({ camp: "pensie_lunara", op: "==", valoare: 3000 }, {})).toBe("necunoscut");
  });

  it("o schimbare expirată e marcată", () => {
    const s = { ...CATALOG[0], expira_la: "2026-01-01" } as Schimbare;
    expect(momentul(s, AZI)).toBe("expirat");
  });
});

describe("profil", () => {
  it("adaugă fără dubluri și ignoră valori invalide", () => {
    const p = adaugaInProfil(profil({ taguri: ["angajat"] }), ["angajat", "it"], { salariu_net: 7000, pensie_lunara: NaN });
    expect(p.taguri).toEqual(["angajat", "it"]);
    expect(p.valori).toEqual({ salariu_net: 7000 });
  });

  it("normalizează ce vine din storage: aruncă etichete necunoscute și valori nenumerice", () => {
    const p = normalizeaza({ taguri: ["angajat", "altceva", "angajat"], valori: { salariu_net: "7000", dividende_anuale: 1000 } });
    expect(p).toEqual({ taguri: ["angajat"], valori: { dividende_anuale: 1000 } });
    expect(normalizeaza(null)).toEqual(PROFIL_GOL);
  });
});
