import { describe, expect, it } from "vitest";
import { cripteaza, emailValid, parolaValida, verifica } from "./parola";
import { amprenta, citesteToken, creeazaToken } from "./token";

const SECRET = "secret-de-test";

describe("parola", () => {
  it("se verifică doar cu parola corectă, iar hash-ul diferă la fiecare criptare", async () => {
    const h1 = await cripteaza("parola-buna-1");
    const h2 = await cripteaza("parola-buna-1");
    expect(h1).not.toBe(h2);
    expect(h1.startsWith("scrypt$")).toBe(true);
    expect(await verifica("parola-buna-1", h1)).toBe(true);
    expect(await verifica("parola-gresita", h1)).toBe(false);
    expect(await verifica("parola-buna-1", "ceva-stricat")).toBe(false);
  });

  it("validează emailul și lungimea parolei", () => {
    expect(emailValid("  Ana@Exemplu.RO ")).toBe("ana@exemplu.ro");
    expect(emailValid("fara-arond")).toBeNull();
    expect(parolaValida("scurta")).toBe(false);
    expect(parolaValida("destul-de-lunga")).toBe(true);
  });
});

describe("linkurile din email", () => {
  it("un token bun se citește, cu scopul lui", () => {
    const t = creeazaToken("confirmare", "ana@exemplu.ro", SECRET);
    expect(citesteToken(t, "confirmare", SECRET)?.email).toBe("ana@exemplu.ro");
    expect(citesteToken(t, "resetare", SECRET)).toBeNull();
  });

  it("respinge tokenul modificat, semnat cu alt secret sau expirat", () => {
    const t = creeazaToken("resetare", "ana@exemplu.ro", SECRET, { acum: 0 });
    expect(citesteToken(t, "resetare", SECRET, 1000)).not.toBeNull();
    expect(citesteToken(t, "resetare", SECRET, 31 * 60_000)).toBeNull();
    expect(citesteToken(t, "resetare", "alt-secret", 1000)).toBeNull();
    const [date, sem] = t.split(".");
    const altEmail = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(date, "base64url").toString()), email: "eu@rau.ro" })).toString("base64url");
    expect(citesteToken(`${altEmail}.${sem}`, "resetare", SECRET, 1000)).toBeNull();
  });

  it("amprenta se schimbă când se schimbă parola", () => {
    expect(amprenta("scrypt$1$a$b")).toBe(amprenta("scrypt$1$a$b"));
    expect(amprenta("scrypt$1$a$b")).not.toBe(amprenta("scrypt$1$a$c"));
  });
});
