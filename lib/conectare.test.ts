import { describe, expect, it } from "vitest";
import { caleSigura, mesajEroareAuth } from "./conectare";
import { traduce } from "./i18n";

describe("contul", () => {
  it("redirecționează doar în aplicație", () => {
    expect(caleSigura("/abonament")).toBe("/abonament");
    expect(caleSigura("https://rau.ro")).toBe("/flux");
    expect(caleSigura("//rau.ro")).toBe("/flux");
    expect(caleSigura("/\\rau.ro")).toBe("/flux");
    expect(caleSigura(undefined)).toBe("/flux");
  });

  it("o eroare de conectare are mesaj, inclusiv una necunoscută", () => {
    expect(mesajEroareAuth("AccessDenied")).toMatch(/anulată/);
    expect(mesajEroareAuth("OAuthCallbackError")).toMatch(/n-a mers/);
  });

  it("fiecare mesaj are traducere în engleză", () => {
    for (const m of ["AccessDenied", "Configuration", "x"].map(mesajEroareAuth)) expect(traduce("en", m)).not.toBe(m);
  });
});
