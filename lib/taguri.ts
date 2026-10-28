/**
 * Taxonomia de etichete: lista fixă din care alege și omul (profil), și LLM-ul
 * (etichetarea actelor, analiza documentelor). ID-urile sunt cele din mockup/index.html,
 * ca regulile de acolo să se porteze fără redenumiri.
 */

export const FAMILII = {
  venit: "Cum câștig",
  detin: "Ce dețin",
  familie: "Cine depinde de mine",
  conduc: "Ce conduc",
  locuinta: "Unde locuiesc",
  domeniu: "Domeniul meu",
  statut: "Situația mea",
} as const;

export type Familie = keyof typeof FAMILII;

export const TAGURI = {
  // Cum câștig
  angajat: { familie: "venit", eticheta: "salariu" },
  pfa: { familie: "venit", eticheta: "PFA" },
  srl_dividende: { familie: "venit", eticheta: "dividende SRL" },
  pensionar: { familie: "venit", eticheta: "pensie" },

  // Ce dețin
  masina: { familie: "detin", eticheta: "mașină" },
  pilon2: { familie: "detin", eticheta: "Pilon II" },
  pilon3: { familie: "detin", eticheta: "Pilon III" },

  // Cine depinde de mine
  parinte: { familie: "familie", eticheta: "copii" },
  parinte_singur: { familie: "familie", eticheta: "cresc copiii singur" },
  intretin_parinti: { familie: "familie", eticheta: "părinți în întreținere" },
  intretin_handicap: { familie: "familie", eticheta: "persoană cu handicap în întreținere" },

  // Ce conduc (PFA e deja la „Cum câștig”; nu îl dublăm)
  micro: { familie: "conduc", eticheta: "SRL microîntreprindere" },

  // Unde locuiesc
  chirias: { familie: "locuinta", eticheta: "chirie" },
  proprietar: { familie: "locuinta", eticheta: "proprietate" },
  ipoteca: { familie: "locuinta", eticheta: "ipotecă" },
  consumator_gaz: { familie: "locuinta", eticheta: "încălzire pe gaz" },
  consumator_energie: { familie: "locuinta", eticheta: "factură de curent pe numele meu" },
  rural: { familie: "locuinta", eticheta: "la sat (mediul rural)" },

  // Domeniul meu (doar categorii)
  it: { familie: "domeniu", eticheta: "IT" },
  constructii: { familie: "domeniu", eticheta: "construcții" },
  horeca: { familie: "domeniu", eticheta: "HoReCa" },
  transport: { familie: "domeniu", eticheta: "transport" },
  sanatate: { familie: "domeniu", eticheta: "sănătate" },
  agricultura: { familie: "domeniu", eticheta: "agricultură" },

  // Situația mea: statute după care legile dau drepturi sau scutiri
  elev_student: { familie: "statut", eticheta: "elev sau student" },
  somer: { familie: "statut", eticheta: "în șomaj" },
  caut_primul_job: { familie: "statut", eticheta: "caut primul loc de muncă" },
  persoana_handicap: { familie: "statut", eticheta: "persoană cu handicap" },
  concediu_crestere: { familie: "statut", eticheta: "în concediu de creștere a copilului" },
  salariu_minim: { familie: "statut", eticheta: "pe salariul minim" },
} as const satisfies Record<string, { familie: Familie; eticheta: string }>;

export type TagId = keyof typeof TAGURI;

export const TOATE_TAGURILE = Object.keys(TAGURI) as TagId[];

export function esteTag(x: unknown): x is TagId {
  return typeof x === "string" && x in TAGURI;
}

export function tagurileFamiliei(familie: Familie): TagId[] {
  return TOATE_TAGURILE.filter((t) => TAGURI[t].familie === familie);
}

export function etichetaTag(id: TagId): string {
  return TAGURI[id].eticheta;
}
