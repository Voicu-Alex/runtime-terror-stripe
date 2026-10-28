import type { Valori } from "./profil";

/**
 * Formulele de impact, în lei pe lună. Negativ = cost, pozitiv = câștig.
 * null = nu se poate calcula din ce știm despre om (lipsește o valoare).
 *
 * Catalogul face trimitere la ele prin nume. LLM-ul nu calculează niciodată sume:
 * doar alege o formulă existentă sau lasă null.
 *
 * Fiecare formulă spune de unde vine cifra. Cele marcate „estimare” sunt medii sau
 * calcule proprii, nu cifre din lege; UI-ul le afișează cu eticheta „estimare”.
 */
export type Formula = (v: Valori) => number | null;

export const FORMULE = {
  /** Legea 141/2025: TVA 19% → 21%. Estimare: 1,68% din cheltuielile lunare (2/119 ≈ 1,68%). */
  tva_21: (v) => (v.cheltuieli_lunare == null ? null : -(v.cheltuieli_lunare * 0.0168)),

  /** Legea 141/2025: impozit pe dividende 10% → 16%, deci 6 puncte din dividendele anuale, pe lună. */
  dividende_16: (v) => (v.dividende_anuale == null ? null : -((v.dividende_anuale * 0.06) / 12)),

  /** Legea 141/2025: CASS 10% doar pe partea din pensie care depășește 3.000 lei. */
  cass_pensii: (v) => (v.pensie_lunara == null ? null : -(Math.max(0, v.pensie_lunara - 3000) * 0.1)),

  /** OUG 6/2025: plafonul la energie a încetat. Impactul depinde de consum; nu avem o medie cu sursă. TODO */
  energie_plafon: () => null,

  /** OUG 12/2026: plafonul la gaz expiră la 31 mar 2027. Impactul depinde de consum; nu avem o medie cu sursă. TODO */
  gaz_plafon: () => null,

  /** Legea 2/2026: schimbă modul de plată la pensionare; azi nu costă nimic. */
  pilon2_plata: () => 0,

  /** Codul fiscal art. 78: deducerea există deja; impactul e în acțiune (pilon3_economie), nu în schimbare. */
  pilon3_deducere: () => 0,

  /** OUG 89/2025: cotă unică 1% la micro. Impactul depinde de cifra de afaceri a firmei; nu îl calculăm. */
  micro_1: () => 0,

  /**
   * OUG 156/2024: scutirea de impozit pe venit în IT (brut până la 10.000 lei) a dispărut.
   * Estimare: 10% × (brut scutit − CAS 25% − CASS 10%) = 10% × 65% × min(brut, 10.000).
   * La 12.000 brut dă 650 lei/lună, cifra din mockup.
   */
  it_scutire: (v) => (v.salariu_brut == null ? null : -(0.1 * 0.65 * Math.min(v.salariu_brut, 10000))),

  /**
   * OUG 156/2024: facilitățile din construcții și agricultură au dispărut. La salariul minim din construcții (4.582 lei brut)
   * netul a scăzut de la 3.196 la 2.739 lei, adică 457 lei/lună (StartupCafe). Estimare pentru salariul minim.
   */
  constructii_facilitati: () => -457,

  /** Legea 141/2025: TVA 11% la servicii HoReCa. Pentru persoana fizică nu estimăm un impact direct. */
  horeca_tva_11: () => 0,

  /** Legea 239/2025 + OUG 78/2025: baza impozitului pe clădiri crește. Estimare din presă: 35 lei/lună. Încredere scăzută. */
  impozit_cladiri: () => -35,

  /**
   * Legea 61/1993 (alocația de stat pentru copii): 292 lei/lună pe copil între 2 și 18 ani,
   * cifră din presă pentru 2026 (ProTV). Sub 2 ani e mai mare; aici folosim cifra de bază. Estimare.
   */
  alocatie_copii: (v) => (v.nr_copii == null ? null : v.nr_copii * 292),

  /** OUG 11/2026 (Legea 76/2002 art. 76^5): prima de stabilitate vine doar dacă faci pașii; impactul e în acțiune. */
  prima_stabilitate: () => 0,

  /** Legea 141/2025 art. III: locuința nouă se cumpără cu TVA 21%; 9% doar cu avans plătit până la 31 iul 2025. Impactul e în acțiune. */
  tva_locuinta: () => 0,

  /**
   * Legea 239/2025 + OUG 78/2025: impozitul auto se calculează după cilindree și norma Euro.
   * Exemplul din presă (Capital): 1.400 cmc, Euro 5, 63 lei în 2025 → 123 lei în 2026 = −60 lei/an = −5 lei/lună. Estimare.
   */
  impozit_auto: () => -5,

  /** Legea 162/2026: acciza redusă la motorină e un câștig automat la pompă; impactul e în acțiune. */
  motorina_acciza: () => 0,

  /** Legea 202/2026: contul CEI-D există din 2027; impactul e în acțiune. */
  cei_d: () => 0,

  // Economii din acțiuni (pozitive):

  /**
   * Legea 141/2025 art. III: 12 puncte de TVA pe o locuință nouă de 400.000 lei fără TVA = 48.000 lei o dată,
   * împărțit pe un credit de 25 de ani (300 de luni), fără dobândă = 160 lei/lună. Estimare (prețul e ales de noi).
   */
  tva_locuinta_economie: () => 48000 / 300,

  /** Codul fiscal art. 472 alin. (2): bonificație de până la 10% (o stabilește primăria) la plata integrală până la 31 mar; 10% din 123 lei/an. Estimare. */
  auto_bonificatie: () => 12.3 / 12,

  /** Legea 162/2026: 701,07 lei/1.000 l acciză × 1,21 TVA ≈ 0,85 lei/l, pe un plin de 50 l, o dată. Estimare (plinul e ales de noi). */
  motorina_economie: () => (50 * 0.85) / 12,

  /** Legea 202/2026 art. 19 pct. 7: contribuția CEI-D se scade din venitul impozabil; 10% din 300 lei depuși pe lună. Estimare (suma depusă e aleasă de noi). */
  cei_d_economie: () => 30,


  /** OUG 11/2026, art. 76^5 alin. (1) lit. a): 1.000 lei/lună în primele 12 luni (1.250 lei/lună în următoarele 12). Cifră din lege. */
  prima_stabilitate_economie: () => 1000,

  /** Deducere Pilon III 400 EUR/an ≈ 2.000 lei × 10% impozit = ≈200 lei/an. Estimare (curs ≈ 5 lei/EUR). */
  pilon3_economie: () => 200 / 12,

  /** Distribuirea profitului 2025 ca dividende înainte de 1 ian 2026 evita cele 6 puncte în plus. */
  dividende_economie: (v) => (v.dividende_anuale == null ? null : (v.dividende_anuale * 0.06) / 12),

  /** Plata integrală a impozitului pe clădiri până la 31 mar aduce bonificație de 10% (din estimarea de 35 lei/lună). */
  cladiri_bonificatie: () => 3.5,
} as const satisfies Record<string, Formula>;

export type FormulaId = keyof typeof FORMULE;

export function esteFormula(x: unknown): x is FormulaId {
  return typeof x === "string" && x in FORMULE;
}

export function calculeaza(id: FormulaId | null, valori: Valori): number | null {
  if (id == null) return null;
  const r = FORMULE[id](valori);
  return r == null ? null : Math.round(r * 100) / 100;
}
