/**
 * Asistentul de profil: cele 6 întrebări din content/parcurs.md §2, starea conversației și
 * contractul API pentru /api/asistent. Logică pură, fără React și fără rețea.
 *
 * Regula produsului (CLAUDE.md): modelul nu inventează etichete și nu calculează sume.
 * Etichetele vin doar din lib/taguri.ts; sumele vin doar din motor (lib/potrivire.ts).
 */
import { esteTag, etichetaTag, type Familie, type TagId } from "./taguri";
import { adaugaInProfil, normalizeaza, type Profil } from "./profil";

/** O etichetă extrasă, cu cuvântul din care a venit („IT din «programator»”). `din` lipsește la butoane. */
export type Extrasa = { tag: TagId; din?: string };

export type RaspunsRapid = { eticheta: string; taguri: TagId[] };

export type Intrebare = {
  pas: 1 | 2 | 3 | 4 | 5 | 6;
  familie: Familie;
  /** Cheia i18n este textul românesc. */
  text: string;
  multiple: boolean;
  raspunsuri: RaspunsRapid[];
};

/** Textele sunt cele din content/parcurs.md §2, neschimbate. „Nu știu ce e Pilonul II” lipsește: explicația nu are încă sursă ASF. */
export const INTREBARI: readonly Intrebare[] = [
  {
    pas: 1,
    familie: "venit",
    text: "Din ce îți vin banii în fiecare lună?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Salariu", taguri: ["angajat"] },
      { eticheta: "PFA", taguri: ["pfa"] },
      { eticheta: "Dividende din SRL", taguri: ["srl_dividende"] },
      { eticheta: "Pensie", taguri: ["pensionar"] },
    ],
  },
  {
    pas: 2,
    familie: "domeniu",
    text: "În ce domeniu lucrezi?",
    multiple: false,
    raspunsuri: [
      { eticheta: "IT", taguri: ["it"] },
      { eticheta: "Construcții", taguri: ["constructii"] },
      { eticheta: "HoReCa", taguri: ["horeca"] },
      { eticheta: "Transport", taguri: ["transport"] },
      { eticheta: "Sănătate", taguri: ["sanatate"] },
      { eticheta: "Agricultură", taguri: ["agricultura"] },
      { eticheta: "Altul", taguri: [] },
    ],
  },
  {
    pas: 3,
    familie: "conduc",
    text: "Ai o firmă sau un PFA pe numele tău?",
    multiple: false,
    raspunsuri: [
      { eticheta: "SRL microîntreprindere", taguri: ["micro"] },
      { eticheta: "PFA", taguri: ["pfa"] },
      { eticheta: "Nu am", taguri: [] },
    ],
  },
  {
    pas: 4,
    familie: "detin",
    text: "Ce ai pe numele tău?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Apartament sau casă", taguri: ["proprietar"] },
      { eticheta: "Mașină", taguri: ["masina"] },
      { eticheta: "Pilon II", taguri: ["pilon2"] },
      { eticheta: "Pilon III", taguri: ["pilon3"] },
    ],
  },
  {
    pas: 5,
    familie: "locuinta",
    text: "Unde stai și cu ce te încălzești?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Chirie", taguri: ["chirias"] },
      { eticheta: "Casa mea", taguri: ["proprietar"] },
      { eticheta: "Am ipotecă", taguri: ["ipoteca"] },
      { eticheta: "Încălzire pe gaz", taguri: ["consumator_gaz"] },
    ],
  },
  {
    pas: 6,
    familie: "familie",
    text: "Ai pe cineva în grijă?",
    multiple: true,
    raspunsuri: [
      { eticheta: "Copii", taguri: ["parinte"] },
      { eticheta: "Părinți", taguri: ["intretin_parinti"] },
      { eticheta: "Nu", taguri: [] },
    ],
  },
];

export const MESAJ_START = "Îți pun 6 întrebări scurte. Răspunzi cu o atingere sau în cuvintele tale. Poți sări peste oricare.";
export const MESAJ_NEINTELES = "Nu am găsit o etichetă în ce ai scris. Alege de mai jos sau sari peste.";
export const SAR_PESTE = "Sar peste";

/** Pasul 3 se sare automat dacă la pasul 1 nu s-a ales una din acestea (parcurs.md §2, nota 1). */
export const TAGURI_FIRMA: readonly TagId[] = ["pfa", "pfa_norma", "srl_dividende"];

export type Mesaj =
  | { rol: "asistent"; text: string }
  | { rol: "om"; text: string }
  | { rol: "etichete"; etichete: Extrasa[] };

export type Stare = {
  /** 1..6; 7 = terminat. */
  pas: number;
  /** Acumulat, fără duplicate pe tag. */
  extrase: Extrasa[];
  mesaje: Mesaj[];
  terminat: boolean;
};

export function porneste(): Stare {
  return {
    pas: 1,
    extrase: [],
    mesaje: [
      { rol: "asistent", text: MESAJ_START },
      { rol: "asistent", text: INTREBARI[0].text },
    ],
    terminat: false,
  };
}

export function intrebareaCurenta(s: Stare): Intrebare | null {
  if (s.terminat || s.pas < 1 || s.pas > INTREBARI.length) return null;
  return INTREBARI[s.pas - 1];
}

/** Adaugă etichetele noi (fără duplicate pe tag; rămâne primul `din`). Întoarce lista nouă și ce s-a adăugat. */
function adauga(existente: Extrasa[], noi: Extrasa[]): { extrase: Extrasa[]; adaugate: Extrasa[] } {
  const extrase = existente.map((e) => ({ ...e }));
  const adaugate: Extrasa[] = [];
  for (const n of noi) {
    if (extrase.some((e) => e.tag === n.tag)) continue;
    const e: Extrasa = n.din ? { tag: n.tag, din: n.din } : { tag: n.tag };
    extrase.push(e);
    adaugate.push({ ...e });
  }
  return { extrase, adaugate };
}

function copie(s: Stare): Stare {
  return {
    pas: s.pas,
    extrase: s.extrase.map((e) => ({ ...e })),
    mesaje: s.mesaje.map((m) => (m.rol === "etichete" ? { rol: "etichete", etichete: m.etichete.map((e) => ({ ...e })) } : { ...m })),
    terminat: s.terminat,
  };
}

/** Trece la următorul pas (sare pasul 3 fără firmă) și pune întrebarea sau rezumatul. */
function avanseaza(s: Stare): Stare {
  const n = copie(s);
  let pas = n.pas + 1;
  if (pas === 3 && !n.extrase.some((e) => TAGURI_FIRMA.includes(e.tag))) pas = 4;
  n.pas = pas;
  if (pas > INTREBARI.length) {
    n.pas = INTREBARI.length + 1;
    n.terminat = true;
    n.mesaje.push({ rol: "asistent", text: rezumat(n) });
  } else {
    n.mesaje.push({ rol: "asistent", text: INTREBARI[pas - 1].text });
  }
  return n;
}

export function raspundeRapid(s: Stare, r: RaspunsRapid[]): Stare {
  if (s.terminat) return copie(s);
  const n = copie(s);
  const { extrase, adaugate } = adauga(
    n.extrase,
    r.flatMap((x) => x.taguri.map((tag) => ({ tag }))),
  );
  n.extrase = extrase;
  n.mesaje.push({ rol: "om", text: r.map((x) => x.eticheta).join(", ") });
  if (adaugate.length > 0) n.mesaje.push({ rol: "etichete", etichete: adaugate });
  return avanseaza(n);
}

/** După ce API-ul a extras etichetele din textul liber. Dacă `extrase` e gol, rămâne pe același pas cu MESAJ_NEINTELES. */
export function raspundeLiber(s: Stare, textOm: string, extrase: Extrasa[]): Stare {
  if (s.terminat) return copie(s);
  const n = copie(s);
  n.mesaje.push({ rol: "om", text: textOm });
  if (extrase.length === 0) {
    n.mesaje.push({ rol: "asistent", text: MESAJ_NEINTELES });
    return n;
  }
  const rez = adauga(n.extrase, extrase);
  n.extrase = rez.extrase;
  if (rez.adaugate.length > 0) n.mesaje.push({ rol: "etichete", etichete: rez.adaugate });
  return avanseaza(n);
}

export function sarPeste(s: Stare): Stare {
  if (s.terminat) return copie(s);
  return avanseaza(s);
}

/** Scoate eticheta din `extrase` și din toate mesajele „etichete”. */
export function scoate(s: Stare, tag: TagId): Stare {
  const n = copie(s);
  n.extrase = n.extrase.filter((e) => e.tag !== tag);
  n.mesaje = n.mesaje.flatMap((m): Mesaj[] => {
    if (m.rol !== "etichete") return [m];
    const etichete = m.etichete.filter((e) => e.tag !== tag);
    return etichete.length > 0 ? [{ rol: "etichete", etichete }] : [];
  });
  return n;
}

/** „Gata. Am notat: salariu, IT, …. Le poți schimba oricând din Profil.” (parcurs.md §2, mesajul de final) */
export function rezumat(s: Stare): string {
  if (s.extrase.length === 0) return "Gata. Nu am notat nicio etichetă. Le poți adăuga oricând din Profil.";
  return "Gata. Am notat: " + s.extrase.map((e) => etichetaTag(e.tag)).join(", ") + ". Le poți schimba oricând din Profil.";
}

export function inProfil(s: Stare, existent: Profil): Profil {
  return adaugaInProfil(existent, s.extrase.map((e) => e.tag));
}

/* ---------- Contract API: /api/asistent ---------- */

export type CerereProfil = { mod: "profil"; text: string; pas: number; taguri: TagId[] };
/** `mesaj`: o propoziție de confirmare în vocea B (docs/voce.md §9), fără sume. */
export type RaspunsProfil = { etichete: Extrasa[]; mesaj: string };

export type MesajIstoric = { rol: "asistent" | "om"; text: string };
export type CerereLege = { mod: "lege"; id: string; profil: Profil; istoric: MesajIstoric[]; intrebare: string };
/** `text`: 2–3 propoziții; se termină cu actul și articolul sau „încă nu am verificat”. `sursa` o pune serverul din catalog, nu modelul. */
export type RaspunsLege = { text: string; sursa: { act: string; articol?: string; url?: string } | null };

export type CerereAsistent = CerereProfil | CerereLege;

/** Validare la runtime: mod, câmpuri, taguri ∈ TOATE_TAGURILE, profil prin normalizeaza(). */
export function esteCerere(x: unknown): x is CerereAsistent {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  if (o.mod === "profil") {
    return (
      typeof o.text === "string" &&
      typeof o.pas === "number" &&
      Number.isFinite(o.pas) &&
      o.pas >= 1 &&
      o.pas <= 6 &&
      Array.isArray(o.taguri) &&
      o.taguri.every(esteTag)
    );
  }
  if (o.mod === "lege") {
    if (typeof o.id !== "string" || o.id.length === 0) return false;
    if (typeof o.intrebare !== "string") return false;
    if (!Array.isArray(o.istoric)) return false;
    const istoricBun = o.istoric.every((m) => {
      if (typeof m !== "object" || m === null) return false;
      const r = m as Record<string, unknown>;
      return (r.rol === "asistent" || r.rol === "om") && typeof r.text === "string";
    });
    if (!istoricBun) return false;
    try {
      normalizeaza(o.profil);
    } catch {
      return false;
    }
    return true;
  }
  return false;
}
