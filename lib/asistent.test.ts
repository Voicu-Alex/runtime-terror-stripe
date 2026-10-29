import { describe, expect, it } from "vitest";
import { TOATE_TAGURILE, type TagId } from "./taguri";
import { PROFIL_GOL } from "./profil";
import { PERSOANE_DEMO } from "./persoane-demo";
import {
  INTREBARI,
  MESAJ_NEINTELES,
  MESAJ_START,
  esteCerere,
  inProfil,
  intrebareaCurenta,
  porneste,
  redaDinTaguri,
  raspundeLiber,
  raspundeRapid,
  rezumat,
  sarPeste,
  scoate,
  sincronizeazaProfil,
  type Stare,
} from "./asistent";

const r = (pas: number, ...etichete: string[]) =>
  INTREBARI[pas - 1].raspunsuri.filter((x) => etichete.includes(x.eticheta));

function toateTagurile(s: Stare): TagId[] {
  return [
    ...s.extrase.map((e) => e.tag),
    ...s.mesaje.flatMap((m) => (m.rol === "etichete" ? m.etichete.map((e) => e.tag) : [])),
  ];
}

describe("asistentul de profil", () => {
  it("nu readaugă la pasul următor etichetele eliminate din chat și păstrează profilul actualizat", () => {
    const initial = raspundeLiber(porneste(), "Sunt angajat", [{ tag: "angajat" }]);
    const profil = { taguri: ["parinte" as const], valori: { nr_copii: 2 } };
    const actualizat = sincronizeazaProfil(initial, profil);
    expect(toateTagurile(actualizat)).not.toContain("angajat");
    expect(actualizat.pas).toBe(initial.pas);
    expect(inProfil(sarPeste(actualizat), profil)).toEqual(profil);
    expect(toateTagurile(initial)).toContain("angajat");
  });
  it("porneste: pas 1, mesajul de start și prima întrebare", () => {
    const s = porneste();
    expect(s.pas).toBe(1);
    expect(s.terminat).toBe(false);
    expect(s.extrase).toEqual([]);
    expect(s.mesaje).toEqual([
      { rol: "asistent", text: MESAJ_START },
      { rol: "asistent", text: INTREBARI[0].text },
    ]);
    expect(intrebareaCurenta(s)).toBe(INTREBARI[0]);
  });

  it("Ion (pensie la pasul 1) sare pasul 3 și ajunge la pasul 4", () => {
    let s = raspundeRapid(porneste(), r(1, "Pensie"));
    expect(s.pas).toBe(2);
    s = raspundeRapid(s, r(2, "Altul"));
    expect(s.pas).toBe(4);
    expect(intrebareaCurenta(s)?.text).toBe(INTREBARI[3].text);
  });

  it("Andrei (salariu + dividende) nu sare pasul 3", () => {
    let s = raspundeRapid(porneste(), r(1, "Salariu", "Dividende din SRL"));
    s = raspundeRapid(s, r(2, "IT"));
    expect(s.pas).toBe(3);
    expect(s.mesaje.at(-1)).toEqual({ rol: "asistent", text: INTREBARI[2].text });
    expect(toateTagurile(s)).toEqual(expect.arrayContaining(["angajat", "srl_dividende", "it"]));
  });

  it("raspundeRapid: mesaj om cu etichetele, chips fără `din`, fără duplicate", () => {
    const s = raspundeRapid(porneste(), r(1, "Salariu", "PFA"));
    expect(s.mesaje.find((m) => m.rol === "om")).toEqual({ rol: "om", text: "Salariu, PFA" });
    expect(s.mesaje.find((m) => m.rol === "etichete")).toEqual({
      rol: "etichete",
      etichete: [{ tag: "angajat" }, { tag: "pfa" }],
    });
    const s2 = raspundeRapid(raspundeRapid(s, r(2, "IT")), r(3, "PFA"));
    expect(s2.extrase.filter((e) => e.tag === "pfa")).toHaveLength(1);
  });

  it("nu mai pune întrebările la care omul a răspuns deja în cuvintele lui", () => {
    // „lucrez ca programator la un SRL, stau cu chirie și am mașină” la pasul 1
    const s = raspundeLiber(porneste(), "lucrez ca programator, stau cu chirie și am mașină", [
      { tag: "angajat", din: "lucrez" },
      { tag: "it", din: "programator" },
      { tag: "chirias", din: "chirie" },
      { tag: "masina", din: "mașină" },
    ]);
    // sare 2 (domeniul: IT), 3 (fără firmă), 4 (deține: mașină), 5 (locuința: chirie) și ajunge la 6
    expect(s.pas).toBe(6);
    const puse = s.mesaje.filter((m) => m.rol === "asistent").map((m) => m.text);
    expect(puse).not.toContain(INTREBARI[1].text);
    expect(puse).not.toContain(INTREBARI[3].text);
    expect(puse).not.toContain(INTREBARI[4].text);
    expect(puse[puse.length - 1]).toBe(INTREBARI[5].text);
  });

  it("sarPeste avansează fără etichete", () => {
    const s = sarPeste(porneste());
    expect(s.pas).toBe(2);
    expect(s.extrase).toEqual([]);
    expect(s.mesaje.at(-1)).toEqual({ rol: "asistent", text: INTREBARI[1].text });
  });

  it("raspundeLiber cu [] rămâne pe pas și spune că nu a înțeles", () => {
    const s = raspundeLiber(porneste(), "bla bla", []);
    expect(s.pas).toBe(1);
    expect(s.mesaje.at(-2)).toEqual({ rol: "om", text: "bla bla" });
    expect(s.mesaje.at(-1)).toEqual({ rol: "asistent", text: MESAJ_NEINTELES });
  });

  it("raspundeLiber cu etichete: dedupe pe tag, păstrează primul `din`, avansează", () => {
    let s = raspundeLiber(porneste(), "sunt programator", [{ tag: "it", din: "programator" }]);
    // IT răspunde deja la pasul 2 (domeniul), iar pasul 3 se sare fără firmă: urmează pasul 4
    expect(s.pas).toBe(4);
    s = raspundeLiber(s, "iar IT", [
      { tag: "it", din: "IT" },
      { tag: "angajat", din: "angajat" },
    ]);
    expect(s.extrase.find((e) => e.tag === "it")?.din).toBe("programator");
    expect(s.extrase).toHaveLength(2);
  });

  it("terminarea: pas 7, terminat, ultimul mesaj e rezumatul; etichete doar din taxonomie", () => {
    let s = porneste();
    s = raspundeRapid(s, r(1, "Salariu"));
    s = raspundeRapid(s, r(2, "IT"));
    s = raspundeRapid(s, r(4, "Mașină", "Pilon II"));
    s = raspundeRapid(s, r(5, "Chirie", "Încălzire pe gaz"));
    s = raspundeRapid(s, r(6, "Copii"));
    expect(s.pas).toBe(7);
    expect(s.terminat).toBe(true);
    expect(intrebareaCurenta(s)).toBeNull();
    expect(s.mesaje.at(-1)).toEqual({ rol: "asistent", text: rezumat(s) });
    for (const t of toateTagurile(s)) expect(TOATE_TAGURILE).toContain(t);
  });

  it("scoate: din extrase și din mesajele etichete; mesajul gol dispare", () => {
    let s = raspundeRapid(porneste(), r(1, "Salariu", "PFA"));
    s = raspundeRapid(s, r(2, "IT"));
    const f = scoate(s, "pfa");
    expect(f.extrase.map((e) => e.tag)).toEqual(["angajat", "it"]);
    expect(toateTagurile(f)).not.toContain("pfa");
    const g = scoate(f, "it");
    expect(g.mesaje.filter((m) => m.rol === "etichete")).toHaveLength(1);
  });

  it("rezumat: text exact", () => {
    let s = raspundeRapid(porneste(), r(1, "Salariu"));
    s = raspundeRapid(s, r(2, "IT"));
    expect(rezumat(s)).toBe("Gata. Am notat: salariu, IT. Le poți schimba oricând din Profil.");
    expect(rezumat(porneste())).toBe("Gata. Nu am notat nicio etichetă. Le poți adăuga oricând din Profil.");
  });

  it("inProfil adaugă etichetele peste profilul existent", () => {
    const s = raspundeRapid(porneste(), r(1, "Salariu"));
    const p = inProfil(s, { taguri: ["masina"], valori: { salariu_brut: 8000 } });
    expect([...p.taguri].sort()).toEqual(["angajat", "masina"]);
    expect(p.valori).toEqual({ salariu_brut: 8000 });
    expect(inProfil(porneste(), PROFIL_GOL)).toEqual(PROFIL_GOL);
  });

  it("funcțiile sunt pure: intrarea nu se schimbă", () => {
    const s = raspundeRapid(porneste(), r(1, "Salariu"));
    const inainte = JSON.stringify(s);
    raspundeRapid(s, r(2, "IT"));
    raspundeLiber(s, "x", [{ tag: "it", din: "x" }]);
    raspundeLiber(s, "x", []);
    sarPeste(s);
    scoate(s, "angajat");
    expect(JSON.stringify(s)).toBe(inainte);
  });

  it("esteCerere", () => {
    expect(esteCerere({ mod: "profil", text: "sunt programator", pas: 2, taguri: ["angajat"] })).toBe(true);
    expect(esteCerere({ mod: "profil", text: "x", pas: 2, taguri: ["nu_exista"] })).toBe(false);
    expect(esteCerere({ mod: "profil", text: "x", pas: 7, taguri: [] })).toBe(false);
    expect(esteCerere({ mod: "x", text: "x", pas: 1, taguri: [] })).toBe(false);
    expect(esteCerere(null)).toBe(false);
    const lege = {
      mod: "lege",
      id: "pilon2_plata",
      profil: { taguri: ["pilon2"], valori: {} },
      istoric: [{ rol: "om", text: "salut" }],
      intrebare: "De ce?",
    };
    expect(esteCerere(lege)).toBe(true);
    expect(esteCerere({ ...lege, id: "" })).toBe(false);
    expect(esteCerere({ ...lege, istoric: [{ rol: "robot", text: "x" }] })).toBe(false);
  });
});

describe("redaDinTaguri", () => {
  const exprimabile = new Set(INTREBARI.flatMap((q) => q.raspunsuri.flatMap((x) => x.taguri)));

  it("Andrei: terminat, cu exact etichetele pe care răspunsurile rapide le pot spune", () => {
    const taguri = PERSOANE_DEMO.andrei.profil.taguri as TagId[];
    const s = redaDinTaguri(taguri);
    expect(s.terminat).toBe(true);
    const asteptat = taguri.filter((t) => exprimabile.has(t)).sort();
    expect(s.extrase.map((e) => e.tag).sort()).toEqual(asteptat);
    expect(asteptat.length).toBeGreaterThan(0);
  });

  it("Ion: pasul 3 e sărit", () => {
    const s = redaDinTaguri(PERSOANE_DEMO.ion.profil.taguri as TagId[]);
    expect(s.terminat).toBe(true);
    expect(s.mesaje.some((m) => m.rol === "asistent" && m.text === INTREBARI[2].text)).toBe(false);
  });

  it("nu scoate nicio etichetă din afara listei", () => {
    const dat: TagId[] = ["it", "pilon2"];
    const s = redaDinTaguri(dat);
    expect(s.terminat).toBe(true);
    expect(toateTagurile(s).every((t) => dat.includes(t))).toBe(true);
    expect(redaDinTaguri([]).extrase).toEqual([]);
  });
});
