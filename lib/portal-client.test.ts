import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClientPortal, PlafonAtins, PortalIndisponibil, USER_AGENT_PORTAL } from "./portal-client";

function fetchFals(statusuri: (number | "retea")[]) {
  const apeluri: { url: string; la: number; init?: RequestInit }[] = [];
  let i = 0;
  const f = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    apeluri.push({ url: String(url), la: Date.now(), init });
    const s = statusuri[Math.min(i++, statusuri.length - 1)];
    if (s === "retea") throw new Error("ECONNRESET");
    return new Response(`corp ${s}`, { status: s });
  });
  return { f: f as unknown as typeof fetch, apeluri };
}

describe("ClientPortal", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("prima cerere pleacă imediat, următoarele după pauza fixă", async () => {
    const { f, apeluri } = fetchFals([200]);
    const c = new ClientPortal({ fetch: f, pauzaMs: 2000 });
    const t0 = Date.now();
    await c.ia("u1");
    expect(apeluri[0].la - t0).toBe(0);
    const p = c.ia("u2");
    await vi.advanceTimersByTimeAsync(1999);
    expect(apeluri.length).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await p;
    expect(apeluri.length).toBe(2);
    expect(apeluri[1].la - t0).toBe(2000);
  });

  it("trimite User-Agent-ul convenit", async () => {
    const { f, apeluri } = fetchFals([200]);
    await new ClientPortal({ fetch: f }).ia("u1");
    expect((apeluri[0].init?.headers as Record<string, string>)["User-Agent"]).toBe(USER_AGENT_PORTAL);
  });

  it("la 429 așteaptă 30 s și reîncearcă o dată", async () => {
    const { f, apeluri } = fetchFals([429, 200]);
    const c = new ClientPortal({ fetch: f });
    const t0 = Date.now();
    const p = c.ia("u");
    await vi.advanceTimersByTimeAsync(29_999);
    expect(apeluri.length).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    const r = await p;
    expect(r.status).toBe(200);
    expect(apeluri[1].la - t0).toBe(30_000);
    expect(c.cereri).toBe(2);
  });

  it("secvența de backoff: 30 s, apoi 120 s, apoi oprire", async () => {
    const { f, apeluri } = fetchFals([503]);
    const c = new ClientPortal({ fetch: f });
    const t0 = Date.now();
    const p = c.ia("u");
    const verifica = expect(p).rejects.toBeInstanceOf(PortalIndisponibil);
    await vi.advanceTimersByTimeAsync(30_000);
    await vi.advanceTimersByTimeAsync(120_000);
    await verifica;
    expect(apeluri.map((a) => a.la - t0)).toEqual([0, 30_000, 150_000]);
    expect(c.cereri).toBe(3);
    expect(c.statusAlte).toBe(3);
  });

  it("eroarea de rețea se tratează ca 5xx", async () => {
    const { f } = fetchFals(["retea", 200]);
    const c = new ClientPortal({ fetch: f });
    const p = c.ia("u");
    await vi.advanceTimersByTimeAsync(30_000);
    expect((await p).status).toBe(200);
    expect(c.erori[0]).toContain("ECONNRESET");
  });

  it("404 nu se reîncearcă și se numără separat", async () => {
    const { f } = fetchFals([404, 200]);
    const c = new ClientPortal({ fetch: f });
    expect((await c.ia("u1")).status).toBe(404);
    const p = c.ia("u2");
    await vi.advanceTimersByTimeAsync(2000);
    await p;
    expect([c.cereri, c.status200, c.status404, c.statusAlte]).toEqual([2, 1, 1, 0]);
  });

  it("plafonul oprește rularea, iar reîncercările se numără", async () => {
    const { f, apeluri } = fetchFals([200]);
    const c = new ClientPortal({ fetch: f, max: 2, pauzaMs: 1 });
    await c.ia("u1");
    const p = c.ia("u2");
    await vi.advanceTimersByTimeAsync(1);
    await p;
    await expect(c.ia("u3")).rejects.toBeInstanceOf(PlafonAtins);
    expect(apeluri.length).toBe(2);

    const { f: f2, apeluri: ap2 } = fetchFals([500]);
    const c2 = new ClientPortal({ fetch: f2, max: 2 });
    const p2 = c2.ia("u");
    const v = expect(p2).rejects.toBeInstanceOf(PlafonAtins);
    await vi.advanceTimersByTimeAsync(30_000);
    await v;
    expect(ap2.length).toBe(2);
  });
});
