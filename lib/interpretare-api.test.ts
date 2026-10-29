import { describe, expect, it } from "vitest";
import { pregatesteRand, urcaInterpretare } from "./importa-interpretare";
import { FISIERE_SISTEM, FISIER_INSTRUCTIUNI, PRETURI, construiesteSistem, costUsd, cuReincercare, extrageJson, interpreteazaText, type ClientMesaje } from "./interpretare-api";
import { interp } from "./interpretare.fixtura";

const usage = { input_tokens: 1000, output_tokens: 500, cache_creation_input_tokens: 2000, cache_read_input_tokens: 10000 };

describe("extrageJson", () => {
  it("bloc ```json", () => expect(extrageJson('Iată:\n```json\n{"a": 1}\n```\ngata')).toEqual({ a: 1 }));
  it("fără gard", () => expect(extrageJson('text {"a": {"b": 2}} coadă')).toEqual({ a: { b: 2 } }));
  it("invalid", () => {
    expect(extrageJson("niciun obiect")).toBeNull();
    expect(extrageJson('```json\n{"a": \n```')).toBeNull();
  });
});

describe("costUsd", () => {
  it("sonnet: 1000 in, 2000 scris, 10000 citit, 500 out", () => {
    expect(costUsd(usage, "claude-sonnet-5-5")).toBeCloseTo((1000 * 2 + 2000 * 2.5 + 10000 * 0.2 + 500 * 10) / 1e6, 10);
  });
  it("haiku mai ieftin, model necunoscut aruncă", () => {
    expect(costUsd(usage, "claude-haiku-5-5")).toBeLessThan(costUsd(usage, "claude-sonnet-5-5"));
    expect(Object.keys(PRETURI)).toHaveLength(3);
    expect(() => costUsd(usage, "x")).toThrow(/preț/);
  });
});

describe("construiesteSistem", () => {
  it("instrucțiunile cu data de azi, apoi fișierele în ordine, cu gard", async () => {
    const citite: string[] = [];
    const s = await construiesteSistem("2026-10-29", async (c) => {
      citite.push(c);
      return c === FISIER_INSTRUCTIUNI ? "Azi e {{AZI}}. {{AZI}}" : `continut ${c}`;
    });
    expect(citite).toEqual([FISIER_INSTRUCTIUNI, ...FISIERE_SISTEM]);
    const parti = s.split("\n\n");
    expect(parti[0]).toBe("Azi e 2026-10-29. 2026-10-29");
    expect(parti[1]).toBe("## Fișierele la care trimit instrucțiunile");
    expect(s).toContain("### lib/taguri.ts\n\n```\ncontinut lib/taguri.ts\n```");
    expect(s).toContain("### data/destinatii.json\n\n```\ncontinut data/destinatii.json\n```");
    expect(s.endsWith("### data/referinte.json\n\n```\ncontinut data/referinte.json\n```")).toBe(true);
  });
});

function clientFals(...raspunsuri: (object | Error)[]): ClientMesaje & { apeluri: any[] } {
  const apeluri: any[] = [];
  return {
    apeluri,
    messages: {
      stream(params: any) {
        apeluri.push(params);
        const r = raspunsuri.shift();
        return {
          finalMessage: async () => {
            if (r instanceof Error) throw r;
            return r as any;
          },
        };
      },
    },
  };
}
const raspuns = (text: string, extra: object = {}) => ({ content: [{ type: "text", text }], stop_reason: "end_turn", usage, ...extra });
const fara = async () => {};
const arg = { model: "claude-haiku-5-5", sistem: "", text: "" };

describe("interpreteazaText", () => {
  it("succes: parametrii apelului și rezultatul", async () => {
    const c = clientFals(raspuns("```json\n" + JSON.stringify(interp) + "\n```"));
    const r = await interpreteazaText(c, { model: "claude-haiku-5-5", sistem: "SIS", text: "ACT" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.interpretare.act).toBe(interp.act);
      expect(r.usd).toBeCloseTo(costUsd(usage, "claude-haiku-5-5"), 10);
    }
    const p = c.apeluri[0];
    expect(p.max_tokens).toBe(32000);
    expect(p.system[0]).toEqual({ type: "text", text: "SIS", cache_control: { type: "ephemeral" } });
    expect(p.messages[0].content).toBe("ACT\n\nInterpretează actul de mai sus după instrucțiuni și întoarce doar obiectul JSON.");
  });
  it("refuz", async () => {
    const r = await interpreteazaText(clientFals(raspuns("", { stop_reason: "refusal", stop_details: { category: "x" } })), arg);
    expect(r).toMatchObject({ ok: false, motiv: "refuz" });
  });
  it("JSON invalid păstrează răspunsul brut", async () => {
    const r = await interpreteazaText(clientFals(raspuns("nu e json")), arg);
    expect(r).toMatchObject({ ok: false, motiv: "json_invalid", brut: "nu e json" });
  });
  it("429 se reîncearcă o dată după 20 s, 400 nu", async () => {
    const e429 = Object.assign(new Error("rate"), { status: 429 });
    const pauze: number[] = [];
    const r = await interpreteazaText(clientFals(e429, raspuns(JSON.stringify(interp))), arg, { asteapta: async (ms) => void pauze.push(ms) });
    expect(r.ok).toBe(true);
    expect(pauze).toEqual([20000]);
    const c2 = clientFals(Object.assign(new Error("rea"), { status: 400 }));
    expect(await interpreteazaText(c2, arg, { asteapta: fara })).toMatchObject({ ok: false, motiv: "eroare" });
    expect(c2.apeluri).toHaveLength(1);
    const c3 = clientFals(new Error("overloaded"), new Error("overloaded"));
    expect(await interpreteazaText(c3, arg, { asteapta: fara })).toMatchObject({ ok: false, motiv: "eroare" });
    expect(c3.apeluri).toHaveLength(2);
  });
});

describe("pregatesteRand / urcaInterpretare", () => {
  const text = "Titlu\nu\n\nText\n\nTextul primit conține doar articolele: 1, 2";
  const baza = { actId: "portal:1", model: "m", driver: "api", versiune: "v3", interpretare: interp, text, azi: "2026-10-29" };
  it("rândul și costul în lot", () => {
    const cost = { input: 1, cache_write: 2, cache_read: 3, output: 4, usd: 0.01, secunde: 1.5 };
    const { rand, verificari } = pregatesteRand({ ...baza, usage: cost });
    expect(rand).toMatchObject({ act_id: "portal:1", model: "m", driver: "api", instructiuni_versiune: "v3", stare: "propus", verificari });
    expect(rand.lot).toMatchObject({ articole: ["1", "2"], lungime: text.length, usage: cost });
    expect(rand.lot.text_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(pregatesteRand(baza).rand.lot).not.toHaveProperty("usage");
  });
  /** Client fals: `acte.update(...).eq().in().select()` întoarce `trecute`, `interpretari.upsert` se notează în jurnal. */
  const clientFals = (trecute: { id: string }[], jurnal: unknown[]) => ({
    from: (t: string) => ({
      upsert: async (_r: unknown, o: unknown) => (jurnal.push([t, "upsert", o]), { data: null, error: null }),
      update: (v: unknown) => ({
        eq: (c: string, x: string) => ({
          in: (c2: string, l: string[]) => ({ select: async (col: string) => (jurnal.push([t, v, c, x, c2, l, col]), { data: trecute, error: null }) }),
        }),
      }),
    }),
  });
  it("actualizarea stării, cu garda, apoi upsert", async () => {
    const jurnal: unknown[] = [];
    const rez = await urcaInterpretare(clientFals([{ id: "portal:1" }], jurnal), pregatesteRand(baza).rand, "portal:1");
    expect(rez).toEqual({ urcat: true });
    expect(jurnal).toEqual([
      ["acte", { stare_procesare: "interpretat" }, "id", "portal:1", "stare_procesare", ["candidat", "triat_da", "nou"], "id"],
      ["interpretari", "upsert", { onConflict: "act_id,model,driver,instructiuni_versiune" }],
    ]);
  });
  it("act aprobat/respins: nu se atinge nimic, nici rândul din interpretari", async () => {
    const jurnal: unknown[] = [];
    const rez = await urcaInterpretare(clientFals([], jurnal), pregatesteRand(baza).rand, "portal:1");
    expect(rez).toEqual({ urcat: false, motiv: "actul nu e în stare candidat/triat_da/nou" });
    expect(jurnal.some((j) => (j as unknown[])[1] === "upsert")).toBe(false);
  });
});

describe("cuReincercare", () => {
  const asteapta = async () => {};
  it("reîncearcă o dată la 429/5xx/overloaded", async () => {
    for (const eroare of [Object.assign(new Error("x"), { status: 429 }), Object.assign(new Error("x"), { status: 503 }), new Error("Overloaded")]) {
      let n = 0;
      const rez = await cuReincercare(async () => (++n === 1 ? Promise.reject(eroare) : "ok"), { asteapta });
      expect(rez).toBe("ok");
      expect(n).toBe(2);
    }
  });
  it("nu reîncearcă la 400 și renunță după a doua eroare", async () => {
    let n = 0;
    await expect(cuReincercare(async () => (++n, Promise.reject(Object.assign(new Error("rău"), { status: 400 }))), { asteapta })).rejects.toThrow("rău");
    expect(n).toBe(1);
    n = 0;
    await expect(cuReincercare(async () => (++n, Promise.reject(Object.assign(new Error("tot 500"), { status: 500 }))), { asteapta })).rejects.toThrow("tot 500");
    expect(n).toBe(2);
  });
});
