import { describe, expect, it } from "vitest";
import { actualizatLa, CATALOG, valideazaCatalog, CatalogInvalid, type Schimbare } from "./catalog";
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
      expect(s.sursa_url === "TODO" || s.sursa_url.startsWith("https://")).toBe(true);
      expect(s.niveluri.zero.length).toBeGreaterThan(10);
    }
  });

  it("o intrare cu sursa TODO nu poate fi marcată ca verificată", () => {
    for (const s of CATALOG) if (s.sursa_url === "TODO") expect(s.verificat_la).toBeNull();
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
    // o etichetă pe care n-o folosește încă niciun act; catalogul crește, deci nu fixăm una anume
    const nefolosita = TOATE_TAGURILE.find((t) => !CATALOG.some((s) => s.taguri.includes(t)));
    expect(nefolosita, "toate etichetele au cel puțin un act: alege alt caz de test").toBeDefined();
    expect(potriveste(profil({ taguri: [nefolosita!] }), CATALOG, AZI)).toEqual([]);
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

  it("vârsta se derivă din anul nașterii: la 60 de ani apare pensionarea, la 30 nu", () => {
    const la60 = potriveste(profil({ taguri: ["angajat"], valori: { an_nastere: 1966 } }), CATALOG, AZI);
    expect(la60.map((p) => p.schimbare.id)).toContain("varsta_pensionare");
    const la30 = potriveste(profil({ taguri: ["angajat"], valori: { an_nastere: 1996 } }), CATALOG, AZI);
    expect(la30.map((p) => p.schimbare.id)).not.toContain("varsta_pensionare");
  });

  it("fără anul nașterii, pensionarea e „posibil” și cere an_nastere, nu „varsta”", () => {
    const r = potriveste(profil({ taguri: ["angajat"] }), CATALOG, AZI);
    const p = r.find((x) => x.schimbare.id === "varsta_pensionare")!;
    expect(p.stare).toBe("posibil");
    expect(p.valori_lipsa).toEqual(["an_nastere"]);
  });

  it("părinte singur cu 2 copii: alocația de stat dă 584 lei/lună, alocația de susținere apare fără sumă", () => {
    const r = potriveste(profil({ taguri: ["parinte_singur"], valori: { nr_copii: 2 } }), CATALOG, AZI);
    expect(r.find((p) => p.schimbare.id === "alocatie_copii")!.impact_lei_luna).toBe(584);
    const sustinere = r.find((p) => p.schimbare.id === "alocatie_sustinere_familie")!;
    expect(sustinere.stare).toBe("sigur");
    expect(sustinere.impact_lei_luna).toBeNull();
  });

  it("numără zilele până la termen", () => {
    const r = potriveste(profil({ taguri: ["pilon3"] }), CATALOG, AZI);
    expect(r.find((p) => p.schimbare.id === "pilon3_deducere")!.zile_pana_la_termen).toBe(64);
  });
});

describe("planulMeu", () => {
  it("un plin aduce o economie punctuală, fără să modifice economiile anuale", () => {
    const p = profil({ taguri: ["masina"] });
    const r = potriveste(p, CATALOG.filter(s => s.id === "motorina_acciza"), AZI);
    const plan = planulMeu(r, new Set(["motorina_acciza"]), p.valori, AZI);
    expect(plan.economii).toBe(0);
    expect(plan.cu_actiuni).toBe(0);
    expect(plan.economii_punctuale).toBe(42.5);
  });

  it("o acțiune cu termenul trecut nu mai aduce economii în plan", () => {
    const p = profil({ taguri: ["cumpar_locuinta"] });
    const r = potriveste(p, CATALOG.filter(s => s.id === "tva_locuinta"), AZI);
    const plan = planulMeu(r, new Set(["tva_locuinta"]), p.valori, AZI);
    expect(plan.economii).toBe(0);
    expect(plan.economii_punctuale).toBe(0);
  });

  it("adună impacturile și economiile din acțiunile bifate", () => {
    const p = profil({ taguri: ["srl_dividende", "pilon3"], valori: { dividende_anuale: 24000 } });
    const r = potriveste(p, CATALOG, AZI);
    const fara = planulMeu(r, new Set(), p.valori, AZI);
    expect(fara.fara_actiuni).toBe(-120);
    expect(fara.economii).toBe(0);
    const cu = planulMeu(r, new Set(["pilon3_deducere"]), p.valori, AZI);
    expect(cu.economii).toBeCloseTo(16.67, 1);
    expect(cu.cu_actiuni).toBeCloseTo(-103.33, 1);
  });

  it("prima de stabilitate păstrează în plan perioada primului an", () => {
    const p = profil({ taguri: ["caut_primul_job"], valori: { an_nastere: 2003 } });
    const r = potriveste(p, CATALOG, AZI);
    const plan = planulMeu(r, new Set(["prima_stabilitate"]), p.valori, AZI);
    expect(plan.economii).toBe(1000);
    expect(plan.unitate).toBe("lei în primul an");
    expect(plan.economii_punctuale).toBe(0);
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

describe("forma la zi", () => {
  const baza = CATALOG.find((s) => s.id === "gaz_plafon")!;
  const vechi: Schimbare = { ...baza, id: "vechi", publicat_la: "2025-02-28", in_vigoare_de_la: "2025-04-01", modificat_prin: undefined, inlocuieste: undefined };
  const nou: Schimbare = { ...baza, id: "nou", publicat_la: "2026-03-09", in_vigoare_de_la: "2026-04-01", inlocuieste: ["vechi"] };
  const p = profil({ taguri: ["consumator_gaz"] });

  it("actul înlocuit dispare din flux după publicarea celui nou", () => {
    const ids = potriveste(p, [vechi, nou], "2026-10-28").map((x) => x.schimbare.id);
    expect(ids).toEqual(["nou"]);
  });

  it("până la publicarea celui nou, cel vechi rămâne (iar cel nou apare ca „urmează”)", () => {
    const r = potriveste(p, [vechi, nou], "2026-03-01");
    expect(r.map((x) => x.schimbare.id)).toEqual(["vechi", "nou"]);
    expect(r[1].moment).toBe("urmeaza");
  });

  it("data formei la zi e ultima modificare cu dată cunoscută, altfel publicarea", () => {
    expect(actualizatLa(baza)).toBe("2026-03-26"); // OUG 19/2026
    expect(actualizatLa(vechi)).toBe("2025-02-28");
    const faraData: Schimbare = { ...vechi, modificat_prin: [{ act: "OG x", mo_ref: "TODO", data: null, ce: "", sursa_url: "TODO" }] };
    expect(actualizatLa(faraData)).toBe("2025-02-28");
  });

  it("respinge o intrare care înlocuiește un id inexistent", () => {
    expect(() => valideazaCatalog([{ ...baza, inlocuieste: ["nu_exista"] }])).toThrow(CatalogInvalid);
  });

  it("fiecare modificare din catalog are act și o sursă sau TODO", () => {
    for (const s of CATALOG)
      for (const m of s.modificat_prin ?? []) {
        expect(m.act.length).toBeGreaterThan(3);
        expect(m.sursa_url === "TODO" || m.sursa_url.startsWith("https://")).toBe(true);
      }
  });
});
