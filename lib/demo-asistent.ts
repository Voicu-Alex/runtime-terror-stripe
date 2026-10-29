/**
 * Modul demo al asistentului: fără cheie API, ruta răspunde de aici. Nimic inventat:
 * etichetele vin din cuvinte-cheie, răspunsurile despre o lege vin din datele catalogului.
 */
import { etichetaTag, type TagId } from "./taguri";
import type { Schimbare } from "./catalog";
import type { IntrareGhid } from "./ghid";
import type { Potrivire } from "./potrivire";
import { MESAJ_NEINTELES, type CerereLege, type CerereProfil, type Extrasa, type RaspunsLege, type RaspunsProfil } from "./asistent";
import { faraTODO } from "./continut";

export type DateCard = { schimbare: Schimbare; ghid?: IntrareGhid; potrivire?: Potrivire };

/** Cuvânt → etichetă. Regex cu limite de cuvânt, pe textul scris de om (cu sau fără diacritice). */
export const CUVINTE: readonly { regex: RegExp; tag: TagId }[] = [
  { regex: /\b(salariu|angajat|salariat)\w*/i, tag: "angajat" },
  { regex: /\bpfa\b/i, tag: "pfa" },
  { regex: /\b(srl|dividend\w*)/i, tag: "srl_dividende" },
  { regex: /\bpensi\w*/i, tag: "pensionar" },
  { regex: /\b(programator\w*|it|software|dezvoltator\w*)\b/i, tag: "it" },
  { regex: /\bconstruc\w*/i, tag: "constructii" },
  { regex: /\b(restaurant\w*|horeca|cafenea|hotel\w*)\b/i, tag: "horeca" },
  { regex: /\b(transport\w*|șofer\w*|sofer\w*|curier\w*)/i, tag: "transport" },
  { regex: /\b(spital\w*|medic\w*|asistent[ăa] medical[ăa]?)/i, tag: "sanatate" },
  { regex: /\b(ferm[ăaei]\w*|agric\w*)/i, tag: "agricultura" },
  { regex: /\b(chirie|chiriaș\w*|chirias\w*)/i, tag: "chirias" },
  { regex: /\b(apartament\w*|casa mea|casă proprie|casa proprie|proprietar\w*)/i, tag: "proprietar" },
  { regex: /\b(ipotec\w*|credit imobiliar|rate la bancă|rate la banca)/i, tag: "ipoteca" },
  { regex: /\bgaz\w*/i, tag: "consumator_gaz" },
  { regex: /\b(factur\w* de curent|curentul|energi\w*)/i, tag: "consumator_energie" },
  { regex: /\b(copil\w*|copii)/i, tag: "parinte" },
  { regex: /\b(mașin\w*|masin\w*)/i, tag: "masina" },
  { regex: /\bpilon(ul)? ?(2|ii)\b/i, tag: "pilon2" },
  { regex: /\bpilon(ul)? ?(3|iii)\b/i, tag: "pilon3" },
  { regex: /\b(microîntreprindere|microintreprindere|micro)\b/i, tag: "micro" },
  { regex: /\b(student\w*|elev\w*)/i, tag: "elev_student" },
  { regex: /\b(șomaj\w*|somaj\w*|șomer\w*|somer\w*)/i, tag: "somer" },
  { regex: /\b(primul (loc de muncă|loc de munca|job)|absolvent\w*|caut de lucru)/i, tag: "caut_primul_job" },
  { regex: /\b(salariul minim|minim pe economie)/i, tag: "salariu_minim" },
  { regex: /\b(la țară|la tara|sat|comun[ăa])\b/i, tag: "rural" },
  { regex: /\b(cumpăr|cumpar|vreau să iau (o )?(casă|apartament|locuință)|vreau sa iau (o )?(casa|apartament|locuinta))/i, tag: "cumpar_locuinta" },
];

/** Extragere determinist: cuvintele găsite → etichete, cu cuvântul în `din`. Fără sume în `mesaj`. */
export function demoProfil(c: CerereProfil): RaspunsProfil {
  const etichete: Extrasa[] = [];
  for (const { regex, tag } of CUVINTE) {
    if (c.taguri.includes(tag) || etichete.some((e) => e.tag === tag)) continue;
    const m = regex.exec(c.text);
    if (m) etichete.push({ tag, din: m[0] });
  }
  if (etichete.length === 0) return { etichete, mesaj: MESAJ_NEINTELES };
  return { etichete, mesaj: "Am notat: " + etichete.map((e) => etichetaTag(e.tag)).join(", ") + ". Scoate ce nu e cazul." };
}

/** Un câmp din catalog care încă e „TODO” sau gol nu se afișează. */
const bun = (t: string | null | undefined): string | undefined => (t && t.trim() && !t.includes("TODO") ? t : undefined);
const curat = (t: string | null | undefined) => (t ? faraTODO(t) : "");

/**
 * Răspuns pentru un card din datele lui: niveluri.curios (sau zero), apoi actul și articolul.
 * Alege textul după tipul întrebării („de ce mă privește”, „ce înseamnă”, „dacă nu fac nimic”), numai din date.
 */
export function demoLege(c: CerereLege, date: DateCard): RaspunsLege {
  const { schimbare, ghid, potrivire } = date;
  const q = c.intrebare.toLowerCase();
  const zero = curat(schimbare.niveluri.zero);
  const curios = curat(schimbare.niveluri.curios) || zero;
  let baza: string;
  if (/de ce|privește|priveste/.test(q)) {
    const comune = potrivire?.taguri_comune ?? [];
    baza = comune.length > 0 ? "Te privește pentru că ai în profil: " + comune.map(etichetaTag).join(", ") + ". " + zero : zero;
  } else if (/eșalonat|esalonat|înseamnă|inseamna|rate/.test(q)) {
    baza = curios;
  } else if (/nu fac nimic|dacă nu|daca nu|ignor/.test(q)) {
    baza = ghid && ghid.pasi.length > 0 ? ghid.pasi.map(curat).filter(Boolean).join(" ") : zero;
    const a = schimbare.actiuni?.[0];
    if (a) baza += ` Singura acțiune din lege: ${curat(a.text)}${a.termen ? `, până pe ${a.termen}` : ""}.`;
  } else {
    baza = curios;
  }
  const articol = bun(schimbare.articol);
  const url = bun(schimbare.sursa_url);
  const sfarsit = schimbare.act + (articol ? ", " + articol : "") + ".";
  const text = (baza.trim() + " " + sfarsit).trim();
  return {
    text,
    sursa: { act: schimbare.act, articol, url },
  };
}
