import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({ default: class { static APIError = class extends Error {}; messages = { create }; } }));
import { POST } from "@/app/api/asistent/route";

const body = (mesaj: string, extra: Record<string, unknown> = {}) => ({ mod: "chat", mesaj, istoric: [], profil: { taguri: [], valori: {} }, ...extra });
const cere = (x: unknown) => POST(new Request("http://x/api/asistent", { method: "POST", body: JSON.stringify(x) }));

describe("POST /api/asistent chat", () => {
  const cheie = process.env.ANTHROPIC_API_KEY;
  beforeEach(() => { delete process.env.ANTHROPIC_API_KEY; create.mockReset(); });
  afterEach(() => { if (cheie === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = cheie; });

  it("fără cheie răspunde demo, cu sursă verificată, fără persistența profilului", async () => {
    const r = await cere(body("Ce este Pilonul II?"));
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.mod).toBe("demo");
    expect(j.intentie).toBe("termen");
    expect(j.propuneri).toEqual({ adauga: [], scoate: [] });
    expect(j.surse[0].url).toBe("https://legislatie.just.ro/Public/DetaliiDocumentAfis/83682");
    expect(create).not.toHaveBeenCalled();
  });

  it("păstrează conversația în demo când bugetul de apeluri este epuizat", async () => {
    process.env.ANTHROPIC_API_KEY = "test-only";
    vi.stubEnv("LIMITA_ASISTENT_PE_ZI", "0");
    try {
      const r = await cere(body("Ce este TVA?"));
      expect(r.status).toBe(200);
      expect(r.headers.get("cache-control")).toBe("no-store");
      expect((await r.json()).mod).toBe("demo");
      expect(create).not.toHaveBeenCalled();
    } finally { vi.unstubAllEnvs(); }
  });

  it("respinge corpul chat invalid, inclusiv istoric prea lung", async () => {
    expect((await cere(body(" "))).status).toBe(400);
    expect((await cere(body("Salut", { istoric: Array.from({ length: 13 }, () => ({ rol: "om", text: "x" })) }))).status).toBe(400);
    expect((await cere(body("x".repeat(30001)))).status).toBe(400);
  });

  it("cu furnizor mock-uit acceptă numai o reformulare fără cifre sau URL-uri noi", async () => {
    process.env.ANTHROPIC_API_KEY = "test-only";
    create.mockResolvedValueOnce({ stop_reason: "end_turn", content: [{ type: "text", text: "Impozitul pe dividende crește la 16%." }] });
    const j = await (await cere(body("Explică legea despre dividende"))).json();
    expect(j.mod).toBe("model");
    expect(j.text).toContain("Impozitul pe dividende crește la 16%.");
    expect(j.surse[0].url).toBe("https://legislatie.just.ro/Public/DetaliiDocument/300022");
    expect(j.propuneri).toEqual({ adauga: [], scoate: [] });
  });

  it("păstrează starea și data legii chiar dacă parafraza modelului le omite", async () => {
    process.env.ANTHROPIC_API_KEY = "test-only";
    create.mockResolvedValueOnce({ stop_reason: "end_turn", content: [{ type: "text", text: "Legea privește plata pensiei private." }] });
    const j = await (await cere(body("Explică legea despre Pilonul II"))).json();
    expect(j.mod).toBe("model");
    expect(j.text).toContain("2027-01-05");
  });

  it("modelul primește istoricul limitat și definiția selectată, cu sursa atașată de server", async () => {
    process.env.ANTHROPIC_API_KEY = "test-only";
    create.mockResolvedValueOnce({ stop_reason: "end_turn", content: [{ type: "text", text: "TVA este un impozit indirect." }] });
    const j = await (await cere(body("Explică mai simplu", { contextId: "tva", istoric: [
      { rol: "om", text: "Ce este TVA?" },
      { rol: "asistent", text: "TVA este un impozit indirect." },
    ] }))).json();
    expect(j.mod).toBe("model");
    expect(j.intentie).toBe("termen");
    expect(j.surse[0].url).toBe("https://legislatie.just.ro/Public/DetaliiDocument/196995");
    const arg = create.mock.calls[0][0];
    expect(arg.system).toContain("TVA este o taxă");
    expect(arg.system).toContain("fără cunoștințe juridice sau financiare");
    expect(arg.system).toContain("nu repeta răspunsul anterior");
    expect(arg.messages.map((m: { role: string; content: string }) => [m.role, m.content])).toEqual([
      ["user", "Ce este TVA?"], ["assistant", "TVA este un impozit indirect."], ["user", "Explică mai simplu"],
    ]);
  });

  it("cade în demo dacă furnizorul inventează cifre, URL-uri sau eșuează", async () => {
    process.env.ANTHROPIC_API_KEY = "test-only";
    for (const text of ["Taxa este 99%.", "Vezi https://inventat.example/lege"] ) {
      create.mockResolvedValueOnce({ stop_reason: "end_turn", content: [{ type: "text", text }] });
      const j = await (await cere(body("Explică legea despre dividende"))).json();
      expect(j.mod).toBe("demo");
      expect(j.text).not.toContain("99%");
      expect(j.surse[0].url).toBe("https://legislatie.just.ro/Public/DetaliiDocument/300022");
    }
    create.mockRejectedValueOnce(new Error("provider unavailable"));
    const j = await (await cere(body("Explică legea despre dividende"))).json();
    expect(j.mod).toBe("demo");
  });
});
