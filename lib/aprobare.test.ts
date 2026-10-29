import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { adaugaIntrari, aprobaCu, respingeCu, type Dependinte } from "./aprobare";
import { act, interp } from "./interpretare.fixtura";

const RAD = path.join(import.meta.dirname, "..");
const brut = (f: string) => readFileSync(path.join(RAD, f), "utf8");

/** Client Supabase de mână: ține rândurile în memorie și notează scrierile. */
function clientFals(optiuni: { fara_tabele?: boolean; stare?: string } = {}) {
  const tabele: Record<string, any[]> = {
    interpretari: [{ id: 7, act_id: act.id, stare: optiuni.stare ?? "propus", rezultat: interp }],
    acte: [act],
  };
  const scrieri: { tabel: string; op: string; valoare: any; eq?: [string, unknown] }[] = [];
  const client = {
    from(tabel: string) {
      const lant: any = {
        select: () => lant,
        eq(col: string, val: unknown) {
          lant._eq = [col, val];
          return lant;
        },
        maybeSingle: async () => ({ data: tabele[tabel]?.find((r) => r[lant._eq[0]] === lant._eq[1]) ?? null, error: null }),
        upsert: async (valoare: any) => {
          scrieri.push({ tabel, op: "upsert", valoare });
          return optiuni.fara_tabele ? { error: { code: "PGRST205", message: "Could not find the table in the schema cache" } } : { error: null };
        },
        update(valoare: any) {
          lant._update = valoare;
          return lant;
        },
        then(res: (v: unknown) => unknown) {
          if (lant._update) scrieri.push({ tabel, op: "update", valoare: lant._update, eq: lant._eq });
          return Promise.resolve({ error: null }).then(res);
        },
      };
      return lant;
    },
  };
  return { client: client as unknown as Dependinte["client"], scrieri };
}

function dependinte(client: Dependinte["client"]) {
  const scrise: Record<string, any[]> = {};
  const fisiere = { catalog: brut("data/catalog.json"), ghid: brut("data/ghid.json") };
  const dep: Dependinte = {
    client,
    citeste: async (f) => fisiere[f],
    scrie: async (f, text) => {
      scrise[f] = JSON.parse(text);
    },
    acum: () => new Date("2026-10-29T10:00:00Z"),
  };
  return { dep, scrise };
}

describe("adaugaIntrari", () => {
  it("păstrează textul existent neschimbat și adaugă intrarea la sfârșit, cu sfârșitul de linie al fișierului", () => {
    for (const f of ["data/catalog.json", "data/ghid.json"]) {
      const text = brut(f);
      const rezultat = adaugaIntrari(text, [{ id: "nou", lista: ["a", "b"] }]);
      const vechi = text.slice(0, text.lastIndexOf("]")).trimEnd();
      expect(rezultat.startsWith(vechi + ",")).toBe(true);
      expect(JSON.parse(rezultat)).toHaveLength(JSON.parse(text).length + 1);
      const eol = text.includes("\r\n") ? "\r\n" : "\n";
      expect(rezultat.endsWith(`  }${eol}]${eol}`)).toBe(true);
      if (eol === "\r\n") expect(rezultat.replace(/\r\n/g, "")).not.toContain("\n");
    }
  });

  it("merge și pe o listă goală", () => {
    expect(JSON.parse(adaugaIntrari("[]\n", [{ id: "a" }, { id: "b" }]))).toEqual([{ id: "a" }, { id: "b" }]);
  });
});

describe("aprobaCu", () => {
  it("scrie în catalog și ghid, urcă rândurile și marchează interpretarea ca aprobată", async () => {
    const { client, scrieri } = clientFals();
    const { dep, scrise } = dependinte(client);
    const r = await aprobaCu(dep, 7, { revizor: "andrei@exemplu.ro" });

    expect(r).toEqual({ schimbareIds: ["salariul_minim_brut_2026"] });
    const nCatalog = JSON.parse(brut("data/catalog.json")).length;
    expect(scrise.catalog).toHaveLength(nCatalog + 1);
    expect((scrise.catalog.at(-1) as { id: string; verificat_la: string }).verificat_la).toBe("2026-10-29");
    expect(scrise.ghid.at(-1)).toMatchObject({ id: "salariul_minim_brut_2026" });

    const upsertSchimbari = scrieri.find((s) => s.tabel === "schimbari")!;
    expect(upsertSchimbari.valoare).toEqual([{ id: "salariul_minim_brut_2026", ordine: nCatalog, date: scrise.catalog.at(-1) }]);
    expect(scrieri.find((s) => s.tabel === "ghid")!.valoare[0]).toMatchObject({ id: "salariul_minim_brut_2026" });
    expect(scrieri.find((s) => s.tabel === "interpretari" && s.op === "update")).toMatchObject({
      valoare: { stare: "aprobat", schimbare_ids: ["salariul_minim_brut_2026"], nota_revizor: "andrei@exemplu.ro", decis_la: "2026-10-29T10:00:00.000Z" },
      eq: ["id", 7],
    });
    expect(scrieri.find((s) => s.tabel === "acte" && s.op === "update")).toMatchObject({ valoare: { stare_procesare: "aprobat" }, eq: ["id", act.id] });
  });

  it("dacă tabelele schimbari/ghid lipsesc, fișierele rămân scrise și rezultatul are avertisment", async () => {
    const { client } = clientFals({ fara_tabele: true });
    const { dep, scrise } = dependinte(client);
    const r = await aprobaCu(dep, 7, { revizor: "x" });
    expect(scrise.catalog).toBeDefined();
    expect(r.schimbareIds).toHaveLength(1);
    expect(r.avertisment).toMatch(/nu există încă/);
  });

  it("refuză o interpretare deja decisă și un indice greșit", async () => {
    const { dep } = dependinte(clientFals({ stare: "aprobat" }).client);
    await expect(aprobaCu(dep, 7, { revizor: "x" })).rejects.toThrow(/deja/);
    const { dep: dep2 } = dependinte(clientFals().client);
    await expect(aprobaCu(dep2, 7, { revizor: "x", schimbari: [5] })).rejects.toThrow(/nu există/);
  });
});

describe("respingeCu", () => {
  it("marchează interpretarea și actul ca respinse", async () => {
    const { client, scrieri } = clientFals();
    const { dep, scrise } = dependinte(client);
    await respingeCu(dep, 7, { nota: "Nu atinge banii", revizor: "andrei@exemplu.ro" });
    expect(scrise.catalog).toBeUndefined();
    expect(scrieri.find((s) => s.tabel === "interpretari")?.valoare).toMatchObject({ stare: "respins", decis_la: "2026-10-29T10:00:00.000Z" });
    expect(scrieri.find((s) => s.tabel === "interpretari")?.valoare.nota_revizor).toContain("Nu atinge banii");
    expect(scrieri.find((s) => s.tabel === "acte")?.valoare).toEqual({ stare_procesare: "respins" });
  });
});
