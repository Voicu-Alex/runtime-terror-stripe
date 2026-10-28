import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { faraTODO, furnizori, niveluri, specialist } from "./continut";

const s = (id: string) => CATALOG.find((x) => x.id === id)!;

describe("textele Iasminei (content/niveluri.json)", () => {
  it("toate cele 7 chei se leagă de un act din catalog", () => {
    for (const id of ["energie_plafon", "tva_21", "cass_pensii", "dividende_16", "micro_1", "pilon2_plata", "gaz_plafon"]) {
      expect(niveluri(s(id)).autor).toBe("continut");
    }
  });

  it("dividende: Zero, Curios și Expert vin din content, cu sursele ei", () => {
    const n = niveluri(s("dividende_16"));
    expect(n.zero).toMatch(/de la 10% la 16%/);
    expect(n.curios).toMatch(/31 decembrie 2025/);
    expect(n.expert).toMatch(/art\. 97 alin\. \(7\)/);
    expect(n.surse[0]).toBe("https://legislatie.just.ro/Public/DetaliiDocument/300022");
  });

  it("gaz: propoziția cu „Exemplu: TODO” nu se afișează", () => {
    const n = niveluri(s("gaz_plafon"));
    expect(n.curios).not.toMatch(/TODO/);
    expect(n.curios).toMatch(/OUG 12\/2026/);
  });

  it("act fără text de la Iasmina: rămâne textul din catalog, fără TODO", () => {
    const n = niveluri(s("it_scutire"));
    expect(n.autor).toBe("catalog");
    expect(n.curios).toBeNull();
  });

  it("faraTODO păstrează restul propozițiilor", () => {
    expect(faraTODO("Prima. Exemplu: TODO, lipsește. A treia.")).toBe("Prima. A treia.");
  });
});

describe("furnizorii lui Haggy (business/parteneri.json)", () => {
  it("energie și gaz: 4 furnizori, în ordine alfabetică, fără comision", () => {
    const f = furnizori("gaz_plafon");
    expect(f.map((x) => x.nume)).toEqual([...f.map((x) => x.nume)].sort((a, b) => a.localeCompare(b, "ro")));
    expect(f).toHaveLength(4);
    expect(f.every((x) => !x.comision)).toBe(true);
  });

  it("actele fără piață nu primesc furnizori", () => {
    expect(furnizori("dividende_16")).toEqual([]);
  });
});

describe("modalul lui Chris", () => {
  it("dividende: contabil, întrebarea și registrul CECCAR", () => {
    const sp = specialist(s("dividende_16"))!;
    expect(sp.profesie).toBe("contabil");
    expect(sp.intrebare).toMatch(/dividende sau pe salariu/);
    expect(sp.registru?.url).toBe("https://ceccar.ro/ro/?page_id=97");
  });

  it("Pilon II: consultant fiscal, registrul CCF", () => {
    expect(specialist(s("pilon2_plata"))!.registru?.url).toMatch(/ccfiscali\.ro/);
  });

  it("fără profesionist: fără modal", () => {
    expect(specialist(s("gaz_plafon"))).toBeNull();
  });
});
