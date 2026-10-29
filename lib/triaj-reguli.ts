/**
 * Triajul pe reguli al actelor descoperite pe Portal: decide ieftin, fără model, ce acte merită trimise
 * mai departe la interpretare. Funcție pură. Un act respins aici nu se pierde (rămâne `respins_reguli`).
 */

export type ActPentruTriaj = { tip_act: string; titlu: string; emitent: string | null };
export type RezultatTriaj = { candidat: boolean; motive: string[] };

/** Majuscule, fără diacritice (inclusiv varianta cu sedilă), spații normalizate. */
export function normalizeaza(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

const TIPURI_MEREU = new Set(["LEGE", "ORDONANTA", "ORDONANTA DE URGENTA", "HOTARARE"]);
const TIPURI_CONDITIONATE = new Set(["ORDIN", "NORMA", "DECIZIE", "PROCEDURA"]);

/** Emitenți cu efect direct asupra banilor oamenilor (pe text normalizat). */
const EMITENTI_BANI: [RegExp, string][] = [
  [/MINISTERUL FINANTELOR/, "Ministerul Finanțelor"],
  [/\bANAF\b|AGENTIA NATIONALA DE ADMINISTRARE FISCALA/, "ANAF"],
  [/MINISTERUL MUNCII/, "Ministerul Muncii"],
  [/CASA NATIONALA DE PENSII/, "Casa Națională de Pensii"],
  [/\bCNAS\b|CASA NATIONALA DE ASIGURARI DE SANATATE/, "CNAS"],
  [/\bANRE\b|AUTORITATEA NATIONALA DE REGLEMENTARE IN DOMENIUL ENERGIEI/, "ANRE"],
  [/\bASF\b|AUTORITATEA DE SUPRAVEGHERE FINANCIARA/, "ASF"],
  [/\bBNR\b|BANCA NATIONALA/, "BNR"],
  [/\bANOFM\b|AGENTIA NATIONALA PENTRU OCUPAREA FORTEI DE MUNCA/, "ANOFM"],
];

/** Titluri care nu ating banii nimănui, chiar când emitentul e relevant (autorizări, acreditări, numiri). */
const TITLURI_ADMINISTRATIVE = /AUTORIZATI|ACREDITAR|\bNUMIRE|\bNUMIREA|REVOCAR|ELIBERAR\w* DIN FUNCTIE|INCETAREA (RAPORTULUI|DETASARII)|CONFERIR|\bSTRUCTURA ORGANIZATORICA|REGULAMENTUL? DE ORGANIZARE/;

/** Rădăcini de cuvinte din titlu (pe text normalizat, fără diacritice). */
const CUVINTE_CHEIE: [RegExp, string][] = [
  [/\bIMPOZIT/, "impozit"],
  [/\bTAXA\b|\bTAXE\b|\bTAXEL/, "taxă"],
  [/\bTVA\b|TAXA PE VALOAREA ADAUGATA/, "TVA"],
  [/\bSALAR/, "salariu"],
  [/\bPENSI/, "pensie"],
  [/\bALOCAT/, "alocație"],
  [/\bINDEMNIZ/, "indemnizație"],
  [/\bACCIZ/, "accize"],
  [/\bCONTRIBUT/, "contribuție"],
  [/\bPLAFON/, "plafon"],
  [/\bTARIF/, "tarif"],
  [/\bAJUTOR/, "ajutor"],
  [/\bBURS[AEI]\b/, "bursă"],
  [/\bDEDUCER|\bDEDUCTIB/, "deducere"],
  [/\bSCUTIR/, "scutire"],
  [/\bVOUCHER/, "voucher"],
  [/\bTICHET/, "tichete"],
  [/\bCHIRI[EI]|\bINCHIRIER/, "chirie"],
  [/\bCREDIT|\bDOBAND/, "credit/dobândă"],
  [/\bCODUL? FISCAL/, "Codul fiscal"],
  [/\bVENIT/, "venit"],
  [/\bDIVIDEND/, "dividende"],
  [/\bMICROINTREPRINDER/, "microîntreprinderi"],
  [/\bPFA\b|ACTIVITAT\w* INDEPENDENT/, "PFA / activități independente"],
  [/\bSOMAJ/, "șomaj"],
  [/\bCONCEDI/, "concediu"],
  [/\bENERGI|\bGAZE?\b|\bGAZELOR\b|\bELECTRIC/, "energie/gaze"],
  [/\bLOCUINT/, "locuință"],
  [/\bROVINIET/, "rovinietă"],
  [/\bASIGURAR/, "asigurări"],
];

export function triajReguli(act: ActPentruTriaj): RezultatTriaj {
  const tip = normalizeaza(act.tip_act);
  const titlu = normalizeaza(act.titlu);
  const emitent = normalizeaza(act.emitent);

  if (TIPURI_MEREU.has(tip)) {
    return { candidat: true, motive: [`tip ${act.tip_act}: act cu putere de lege sau al Guvernului, mereu candidat`] };
  }

  if (TIPURI_CONDITIONATE.has(tip)) {
    if (emitent.includes("CURTEA CONSTITUTIONALA")) {
      return { candidat: false, motive: [`tip ${act.tip_act} al Curții Constituționale: verifică legi, nu stabilește sume`] };
    }
    const motive: string[] = [];
    const cuvinte = CUVINTE_CHEIE.filter(([re]) => re.test(titlu)).map(([, nume]) => nume);
    if (cuvinte.length) motive.push(`cuvinte cheie în titlu: ${cuvinte.join(", ")}`);
    const emitentBani = EMITENTI_BANI.find(([re]) => re.test(emitent));
    if (emitentBani) {
      // emitentul singur nu ajunge când titlul e administrativ (autorizări, numiri)
      if (!cuvinte.length && TITLURI_ADMINISTRATIVE.test(titlu)) {
        return { candidat: false, motive: [`tip ${act.tip_act} al ${emitentBani[1]}, dar titlu administrativ (autorizare, numire, organizare)`] };
      }
      motive.push(`emitent relevant pentru bani: ${emitentBani[1]}`);
    }
    if (motive.length) return { candidat: true, motive };
    return { candidat: false, motive: [`tip ${act.tip_act} fără emitent relevant pentru bani și fără cuvinte cheie în titlu`] };
  }

  return { candidat: false, motive: [`tip ${act.tip_act || "necunoscut"} exclus din triajul pe reguli`] };
}
