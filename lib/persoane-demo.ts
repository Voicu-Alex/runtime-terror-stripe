import type { Profil } from "./profil";

/**
 * Persoanele fictive din demo (CLAUDE.md: Andrei, Maria, Ion, Ioana; plus Elena, tot fictivă). Etichetele și sumele sunt cele din
 * mockup-uri (v2 PERSONAS); brutul lui Andrei e 8.000 lei, cifra pe care v3 o folosește la IT (−520 lei/lună).
 */
export const PERSOANE_DEMO = {
  andrei: {
    nume: "Andrei, 32",
    profil: {
      taguri: ["angajat", "it", "srl_dividende", "chirias", "cumpar_locuinta", "pilon2", "masina", "consumator_energie", "consumator_gaz"],
      valori: { an_nastere: 1994, nr_copii: 0, salariu_brut: 8000, dividende_anuale: 24000, cheltuieli_lunare: 5000 },
    },
  },
  maria: {
    nume: "Maria, 45",
    profil: {
      taguri: ["pfa", "horeca", "ipoteca", "proprietar", "pilon2", "pilon3", "parinte", "consumator_energie", "consumator_gaz"],
      // un copil: alegere de persona (fictivă), nu o cifră din lege
      valori: { an_nastere: 1981, nr_copii: 1, cheltuieli_lunare: 6000 },
    },
  },
  ion: {
    nume: "Ion, 67",
    profil: {
      taguri: ["pensionar", "proprietar", "masina", "consumator_energie", "consumator_gaz"],
      valori: { an_nastere: 1959, nr_copii: 0, pensie_lunara: 4200, cheltuieli_lunare: 3000 },
    },
  },
  ioana: {
    nume: "Ioana, 23",
    profil: {
      // a terminat studiile, încă fără loc de muncă; cheltuielile sunt alegere de persona (fictivă), nu o cifră din lege
      taguri: ["caut_primul_job", "chirias", "consumator_energie"],
      valori: { an_nastere: 2003, nr_copii: 0, cheltuieli_lunare: 2500 },
    },
  },
  // Fictivă, pentru cardurile care cer o valoare: salariul brut lipsește intenționat,
  // ca aplicația să îl ceară („spune-ne salariul brut”) în loc să afișeze o sumă inventată.
  elena: {
    nume: "Elena, 24",
    profil: {
      taguri: ["angajat", "salariu_minim", "chirias", "consumator_energie"],
      valori: { an_nastere: 2002, nr_copii: 0, cheltuieli_lunare: 2500 },
    },
  },
} satisfies Record<string, { nume: string; profil: Profil }>;

export type PersoanaDemo = keyof typeof PERSOANE_DEMO;

export function idPersoana(id: string | undefined): PersoanaDemo {
  return id && id in PERSOANE_DEMO ? (id as PersoanaDemo) : "andrei";
}

export function persoanaDemo(id: string | undefined): (typeof PERSOANE_DEMO)[PersoanaDemo] {
  return PERSOANE_DEMO[idPersoana(id)];
}
