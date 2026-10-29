import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { niveluri, specialist } from "./continut";
import { DESTINATII } from "./destinatii";
import { GHID } from "./ghid";
import { TRADUCERI, ghidPeLimba, modificari, sursaAct } from "./traduceri";

// Engleza trebuie să țină pasul cu româna: aceleași intrări, același număr de pași, aceleași sume.
// Când adaugi un act, o intrare în ghid sau o destinație, adaugă și traducerea în data/traduceri-en.json.

const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/;
// nume proprii românești care rămân așa și în engleză
const NUME = /Ghișeul\.ro|Brașov|Ploiești|Galați|„|”/g;

describe("data/traduceri-en.json", () => {
  it("fiecare act din catalog are numele, Monitorul Oficial și articolul în engleză", () => {
    const lipsa = CATALOG.filter((s) => {
      const e = TRADUCERI.acte[s.id];
      return !e?.act || !e.mo_ref || !e.articol;
    }).map((s) => s.id);
    expect(lipsa).toEqual([]);
  });

  it("Curios, Expert și specialistul au engleză exact unde au română", () => {
    const gresite: string[] = [];
    for (const s of CATALOG) {
      const ro = niveluri(s, "ro");
      const en = niveluri(s, "en");
      if (!!ro.curios !== (en.limbaDetalii === "en" && !!en.curios) && ro.curios) gresite.push(`${s.id}: curios`);
      if (!!ro.expert !== (en.limbaDetalii === "en" && !!en.expert) && ro.expert) gresite.push(`${s.id}: expert`);
      if (s.specialist && specialist(s, "en")?.limba !== "en") gresite.push(`${s.id}: specialist`);
      if ((s.modificat_prin ?? []).length !== (TRADUCERI.acte[s.id]?.modificat_prin ?? []).length) gresite.push(`${s.id}: modificat_prin`);
    }
    expect(gresite).toEqual([]);
  });

  it("fiecare intrare din /legi are engleză, cu aceiași pași, sume, soluție și notă", () => {
    const gresite: string[] = [];
    for (const g of GHID) {
      const e = TRADUCERI.ghid[g.id];
      if (!e) {
        gresite.push(`${g.id}: lipsește`);
        continue;
      }
      if (e.pasi.length !== g.pasi.length) gresite.push(`${g.id}: ${g.pasi.length} pași în română, ${e.pasi.length} în engleză`);
      for (const k of ["salvezi", "pierzi", "solutie", "nota"] as const) if (!!g[k] !== !!e[k]) gresite.push(`${g.id}: ${k}`);
      for (const k of ["salvezi", "pierzi"] as const) {
        const perioada = (g[k] as { perioada?: string } | null)?.perioada;
        if (perioada && !e[k]?.perioada) gresite.push(`${g.id}: ${k}.perioada`);
      }
    }
    expect(gresite).toEqual([]);
  });

  it("fiecare destinație are numele în engleză", () => {
    expect(Object.keys(DESTINATII).filter((id) => !TRADUCERI.destinatii[id])).toEqual([]);
  });

  it("textele în engleză nu au rămas în română", () => {
    const romana = (x: unknown): boolean => DIACRITICE.test(JSON.stringify(x).replace(NUME, ""));
    const acte = Object.entries(TRADUCERI.acte).filter(([, e]) => romana(e)).map(([id]) => id);
    const ghid = Object.entries(TRADUCERI.ghid).filter(([, e]) => romana(e)).map(([id]) => id);
    expect([...acte, ...ghid]).toEqual([]);
  });

  it("în engleză, cardul și /legi folosesc traducerea; în română rămân textele verificate", () => {
    const s = CATALOG.find((x) => x.id === "dividende_16")!;
    expect(sursaAct(s, "en").act).toEqual({ text: "Law 141/2025", limba: "en" });
    expect(sursaAct(s, "ro").act).toEqual({ text: s.act, limba: "ro" });
    const g = GHID.find((x) => x.id === "tva_locuinta")!;
    expect(ghidPeLimba(g, "en").pentru).toMatch(/^For anyone who bought/);
    expect(ghidPeLimba(g, "en").salvezi!.lei).toBe(g.salvezi!.lei);
    expect(ghidPeLimba(g, "ro")).toMatchObject({ pentru: g.pentru, limba: "ro" });
    const m = CATALOG.find((x) => x.id === "micro_1")!;
    expect(modificari(m, "en")[0]).toMatchObject({ act: "GEO 8/2026", limba: "en" });
  });
});
