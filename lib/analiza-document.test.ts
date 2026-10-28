import { describe, expect, it } from "vitest";
import { CAMPURI_VALORI_DOCUMENT, SCHEMA_ANALIZA, curataValori } from "./analiza-document";

describe("valorile din document", () => {
  it("aruncă null, 0 și textul gol (prin API, modelul completa câmpurile fără legătură așa)", () => {
    expect(curataValori({ salariu_brut: 6500, salariu_net: null, cheltuieli_lunare: 0, furnizor: "", suma_factura: 0 })).toEqual({
      salariu_brut: 6500,
    });
  });

  it("păstrează valorile reale", () => {
    expect(curataValori({ furnizor: "Engie", suma_factura: 553.44 })).toEqual({ furnizor: "Engie", suma_factura: 553.44 });
  });

  it("schema cere fiecare câmp de valoare (poate fi null), ca modelul să nu sară peste salariul net", () => {
    const v = SCHEMA_ANALIZA.properties.valori;
    expect([...v.required].sort()).toEqual([...CAMPURI_VALORI_DOCUMENT].sort());
    expect(Object.keys(v.properties).sort()).toEqual([...CAMPURI_VALORI_DOCUMENT].sort());
  });
});
