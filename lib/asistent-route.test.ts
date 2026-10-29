// Stă în lib/ pentru că vitest.config.ts include doar lib/**/*.test.ts.
// Fără rețea: ANTHROPIC_API_KEY e șters, deci ruta răspunde din modul demo (depinde de lib/demo-asistent.ts și lib/asistent.ts).
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/asistent/route";
import { TOATE_TAGURILE } from "./taguri";

const cere = (body: unknown) =>
  POST(new Request("http://x/api/asistent", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

describe("POST /api/asistent (fără cheie)", () => {
  let cheie: string | undefined;
  beforeEach(() => {
    cheie = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });
  afterEach(() => {
    if (cheie !== undefined) process.env.ANTHROPIC_API_KEY = cheie;
  });

  it("profil: 200 și doar etichete din taxonomie", async () => {
    const r = await cere({ mod: "profil", text: "Sunt programator angajat", pas: 1, taguri: [] });
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(typeof j.mesaj).toBe("string");
    expect(j.etichete.length).toBeGreaterThan(0);
    for (const e of j.etichete) expect(TOATE_TAGURILE).toContain(e.tag);
  });

  it("lege pilon2_plata: 200 cu sursa din catalog", async () => {
    const r = await cere({
      mod: "lege",
      id: "pilon2_plata",
      profil: { taguri: ["pilon2"], valori: {} },
      istoric: [],
      intrebare: "De ce mă privește?",
    });
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.sursa.act).toBe("Legea 2/2026");
    expect(typeof j.text).toBe("string");
  });

  it("corp invalid: 400", async () => {
    const r = await cere({ mod: "nimic" });
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ eroare: "cerere invalidă" });
    expect((await cere("nu e json")).status).toBe(400);
  });

  it("id necunoscut: 404", async () => {
    const r = await cere({ mod: "lege", id: "nu_exista", profil: { taguri: [], valori: {} }, istoric: [], intrebare: "?" });
    expect(r.status).toBe(404);
  });
});
