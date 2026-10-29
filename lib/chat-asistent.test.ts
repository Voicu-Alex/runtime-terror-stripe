import { describe, expect, it, vi } from "vitest";
import { raspundeDemoChat, esteCerereChat } from "./chat-asistent";
import type { CerereChat } from "./chat-asistent";

const cerere = (mesaj: string, extra: Partial<CerereChat> = {}): CerereChat => ({
  mod: "chat", mesaj, istoric: [], profil: { taguri: [], valori: {} }, ...extra,
});

describe("chat conversațional", () => {
  it("reformulează mai simplu termenul discutat, fără să piardă sursa sau limitele", () => {
    const initial = raspundeDemoChat(cerere("Ce este CASS?"));
    for (const mesaj of ["Mai simplu", "Nu am înțeles", "Explică pe înțelesul meu"]) {
      const r = raspundeDemoChat(cerere(mesaj, { contextId: initial.contextId }));
      expect(r.intentie).toBe("termen");
      expect(r.text).not.toBe(initial.text);
      expect(r.text).toContain("sănătate");
      expect(r.text).toContain("venituri");
      expect(r.surse).toEqual(initial.surse);
      expect(r.propuneri).toEqual({ adauga: [], scoate: [] });
    }
    const deducere = raspundeDemoChat(cerere("Mai simplu", { contextId: "deducere" }));
    expect(deducere.text).toContain("nu primești înapoi");
  });

  it("separă trimiterile juridice de explicație și desface jargonul legii", () => {
    const r = raspundeDemoChat(cerere("Explică legea despre Pilonul II"));
    expect(r.text).not.toMatch(/eșalonat|rentă viageră|art\. 55/);
    expect(r.text).toContain("30%");
    expect(r.surse[0].articol).toContain("art. 55");
    const simplificat = raspundeDemoChat(cerere("Nu am înțeles", { contextId: r.contextId }));
    expect(simplificat.intentie).toBe("lege");
    expect(simplificat.contextId).toBe(r.contextId);
    expect(raspundeDemoChat(cerere("Explică mai simplu legea despre Pilonul II")).contextId).toBe(r.contextId);
  });
  it("înțelege formulări obișnuite pentru termeni, inclusiv cifre romane/arabe", () => {
    for (const [mesaj, id] of [["Explică-mi CASS", "cass"], ["Ce este Pilonul 2?", "pilon2"], ["Ce este Pilonul 3?", "pilon3"]]) {
      const r = raspundeDemoChat(cerere(mesaj));
      expect(r.intentie).toBe("termen");
      expect(r.contextId).toBe(id);
      expect(r.propuneri.adauga).toEqual([]);
    }
  });

  it("nu confundă relatarea sau situația altcuiva cu profilul vorbitorului", () => {
    for (const mesaj of ["Am citit că pensionarii plătesc CASS", "Am un angajat", "Sunt curios despre dividende", "Am întrebat un pensionar despre lege", "Am un copil angajat în IT"]) {
      const r = raspundeDemoChat(cerere(mesaj));
      expect(r.propuneri.adauga.filter((tag) => tag !== "parinte")).toEqual([]);
    }
    expect(raspundeDemoChat(cerere("Lucrez în IT și am doi copii")).propuneri.adauga).toEqual(["it", "parinte"]);
  });

  it("arată starea, data viitoare și termenul acțiunii fără să prezinte regula drept curentă", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T12:00:00Z"));
    try {
      const r = raspundeDemoChat(cerere("Explică legea despre Pilonul II"));
      expect(r.text).toContain("2027-01-05");
      expect(r.text).toContain("Adoptat");
      expect(r.text).toContain("nu se aplică încă");
      const cand = raspundeDemoChat(cerere("Și când intră în vigoare?", { contextId: r.contextId }));
      expect(cand.text).toContain("2027-01-05");
      const actiune = raspundeDemoChat(cerere("Până când?", { contextId: "pilon2_plata" }));
      expect(actiune.text).toContain("termen: 2027-01-05");
    } finally { vi.useRealTimers(); }
  });

  it("definește un termen verificat fără să deducă etichete din întrebare", () => {
    const r = raspundeDemoChat(cerere("Ce este TVA?"));
    expect(r.intentie).toBe("termen");
    expect(r.text).toContain("taxă");
    expect(r.surse).toEqual([{ id: "tva", titlu: "Legea nr. 227/2015 privind Codul fiscal", articol: "art. 265", url: "https://legislatie.just.ro/Public/DetaliiDocument/196995", verificatLa: "2026-10-29" }]);
    expect(r.propuneri).toEqual({ adauga: [], scoate: [] });
  });

  it("explică legea dividendelor și continuă cu acțiunea din același act", () => {
    const lege = raspundeDemoChat(cerere("Explică legea despre dividende"));
    expect(lege.intentie).toBe("lege");
    expect(lege.contextId).toBe("dividende_16");
    expect(lege.surse[0]?.url).toBe("https://legislatie.just.ro/Public/DetaliiDocument/300022");
    expect(lege.propuneri.adauga).toEqual([]);
    const continuare = raspundeDemoChat(cerere("Și ce trebuie să fac?", { contextId: lege.contextId }));
    expect(continuare.intentie).toBe("lege");
    expect(continuare.contextId).toBe("dividende_16");
    expect(continuare.text.length).toBeGreaterThan(10);
  });

  it("un subiect nou explicit prevalează față de context", () => {
    const r = raspundeDemoChat(cerere("Ce este CASS?", { contextId: "dividende_16" }));
    expect(r.intentie).toBe("termen");
    expect(r.contextId).toBe("cass");
    const salut = raspundeDemoChat(cerere("Salut", { contextId: "dividende_16" }));
    expect(salut.intentie).toBe("clarificare");
    expect(salut.contextId).toBeUndefined();
    expect(raspundeDemoChat(cerere("Cum e vremea?", { contextId: "dividende_16" })).intentie).toBe("clarificare");
    expect(raspundeDemoChat(cerere("Am o întrebare despre TVA", { contextId: "dividende_16" })).intentie).toBe("clarificare");
  });

  it("continuarea unei definiții nu inventează o obligație personală", () => {
    const r = raspundeDemoChat(cerere("Și ce trebuie să fac?", { contextId: "tva" }));
    expect(r.intentie).toBe("clarificare");
    expect(r.contextId).toBe("tva");
    expect(r.propuneri).toEqual({ adauga: [], scoate: [] });
  });

  it("propune numai schimbări personale explicite, inclusiv eliminarea", () => {
    expect(raspundeDemoChat(cerere("Sunt angajat în IT")).propuneri).toEqual({ adauga: ["angajat", "it"], scoate: [] });
    expect(raspundeDemoChat(cerere("Scoate IT din profil", { profil: { taguri: ["it"], valori: {} } })).propuneri).toEqual({ adauga: [], scoate: ["it"] });
    expect(raspundeDemoChat(cerere("Nu am copii și nu sunt pensionar", { profil: { taguri: ["parinte", "pensionar"], valori: {} } })).propuneri).toEqual({ adauga: [], scoate: ["parinte", "pensionar"] });
    expect(raspundeDemoChat(cerere("Nu am copii")).propuneri).toEqual({ adauga: [], scoate: [] });
    expect(raspundeDemoChat(cerere("Sunt angajat, dar nu am copii", { profil: { taguri: ["parinte"], valori: {} } })).propuneri).toEqual({ adauga: ["angajat"], scoate: ["parinte"] });
    expect(raspundeDemoChat(cerere("Am dividende din SRL")).propuneri.adauga).toEqual(["srl_dividende"]);
    expect(raspundeDemoChat(cerere("Sunt angajat, iar pensionarii au alte reguli")).propuneri.adauga).toEqual(["angajat"]);
  });

  it("nu transformă întrebări generale despre legi în profil", () => {
    for (const mesaj of ["Ce se schimbă pentru pensionari?", "Legea pentru părinți", "Cât plătesc angajații IT?", "Bună"]) {
      expect(raspundeDemoChat(cerere(mesaj)).propuneri).toEqual({ adauga: [], scoate: [] });
    }
    expect(raspundeDemoChat(cerere("Sunt angajat?", { profil: { taguri: [], valori: {} } })).propuneri.adauga).toEqual([]);
  });

  it("nu prezintă definiția românească drept răspuns pentru altă jurisdicție", () => {
    const r = raspundeDemoChat(cerere("Ce este TVA în Germania?"));
    expect(r.intentie).toBe("clarificare");
    expect(r.surse).toEqual([]);
    expect(r.text).toContain("România");
  });

  it("cere precizarea când sunt mai multe acte sau nu găsește subiectul", () => {
    expect(raspundeDemoChat(cerere("Explică legea despre TVA")).intentie).toBe("clarificare");
    expect(raspundeDemoChat(cerere("Explică legea nouă")).surse).toEqual([]);
    expect(raspundeDemoChat(cerere("Și ce trebuie să fac?")).intentie).toBe("clarificare");
    expect(raspundeDemoChat(cerere("Explică alocatie_copii")).surse).toEqual([]);
    const ambiguu = raspundeDemoChat(cerere("Explică legea despre CASS"));
    expect(ambiguu.intentie).toBe("clarificare");
    for (const sugestie of ambiguu.sugestii) {
      const ales = raspundeDemoChat(cerere(sugestie));
      expect(ales.intentie).toBe("lege");
      expect(ales.contextId).toBe(ales.surse[0]?.id);
    }
  });

  it("limitează datele primite și respinge contextul/limba necunoscute", () => {
    expect(esteCerereChat(cerere("Salut"))).toBe(true);
    expect(esteCerereChat(cerere(" "))).toBe(false);
    expect(esteCerereChat(cerere("x".repeat(2001)))).toBe(false);
    expect(esteCerereChat(cerere("x", { contextId: "inventat" }))).toBe(false);
    expect(esteCerereChat(cerere("x", { limba: "fr" as "ro" }))).toBe(false);
    expect(esteCerereChat(cerere("x", { istoric: Array.from({ length: 13 }, () => ({ rol: "om", text: "a" })) }))).toBe(false);
    expect(esteCerereChat(cerere("x", { istoric: [{ rol: "om", text: "x".repeat(2001) }] }))).toBe(false);
  });
});
