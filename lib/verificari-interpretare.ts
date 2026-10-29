import { CINE_APLICA, TIPURI_ACTIUNE } from "./catalog";
import { esteDestinatie } from "./destinatii";
import { esteFormula } from "./formule";
import { esteFormulaTip, formeNumar, formulaCompleta, parametriInText } from "./formule-tip";
import type { InterpretareAct, SchimbareInterpretata } from "./interpretare";
import { CAMPURI_VALORI } from "./profil";
import { esteReferinta } from "./referinte";
import { esteTag } from "./taguri";

/**
 * Verificările automate dinaintea lui /admin/acte: aceleași reguli ca eval/scor.mjs (etichete din listă, citat găsit în
 * text, formule care există, numere din lege, acțiuni tipizate, fără URL-uri scrise de model, fără formulări
 * interzise), mutate în cod pur ca să le ruleze și pipeline-ul, și testele. Rezultatul intră în `interpretari.verificari`.
 */

export type Verificare = { cod: string; mesaj: string; schimbare?: number };
export type RezultatVerificari = {
  trecute: Verificare[];
  picate: Verificare[];
  /** avertismente: nu schimbă `ok` (formula incompletă, schimbare activă cu bani fără formulă) */
  avertismente: Verificare[];
  /** din schimbările active cu direcția cost sau câștig, câte au formulă (scrisă de mână sau parametrizată) */
  calculabile: { cu_formula: number; active_cu_bani: number };
  ok: boolean;
};

const STATUSURI = ["proiect", "adoptat", "in_vigoare"];
const DIRECTII = ["cost", "castig", "termen", "info"];
const INCREDERI = ["ridicata", "medie", "scazuta"];
const OPERATORI = [">", ">=", "<", "<=", "=="];
// „garantat” e interzis ca promisiune, dar „garantat în plată” e termenul din lege
const INTERZISE = [/recomand/i, /cel mai bun/i, /garantat[eăi]?\b(?!\s+în plată)/i];

/** Pentru căutarea citatului: fără diacritice (ș/ş/s), ghilimele și cratime unificate, spații comprimate, litere mici. */
export function normalizeaza(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[„“”«»"]/g, '"')
    .replace(/[‘’`]/g, "'")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function esteDataISO(x: unknown): boolean {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = new Date(`${x}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === x;
}

function numarInText(n: number, text: string): boolean {
  return formeNumar(n).some((forma) => {
    const esc = forma.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![\\d.,])${esc}(?![\\d]|[.,]\\d)`).test(text);
  });
}

/** Toate verificările pentru o interpretare. `textAct` e textul actului din `acte.text` (sau cel trimis modelului). */
export function verificaInterpretare(interp: InterpretareAct, textAct: string, { azi }: { azi: string }): RezultatVerificari {
  const trecute: Verificare[] = [];
  const picate: Verificare[] = [];
  const avertismente: Verificare[] = [];
  const calculabile = { cu_formula: 0, active_cu_bani: 0 };
  const verif = (ok: boolean, cod: string, mesaj: string, schimbare?: number) => {
    const v: Verificare = schimbare === undefined ? { cod, mesaj } : { cod, mesaj, schimbare };
    (ok ? trecute : picate).push(v);
  };
  // verificare moale: trece în `trecute`, iar când pică devine avertisment și nu schimbă `ok`
  const avert = (ok: boolean, cod: string, mesaj: string, schimbare: number) => {
    (ok ? trecute : avertismente).push({ cod, mesaj, schimbare });
  };
  const textNorm = normalizeaza(textAct);
  const schimbari = interp.schimbari ?? [];

  verif(esteDataISO(interp.publicat_la), "publicat_la", esteDataISO(interp.publicat_la) ? "publicat_la e o dată ISO" : `publicat_la lipsește sau nu e dată ISO: „${String(interp.publicat_la)}”`);
  verif(
    interp.atinge_banii || schimbari.length === 0,
    "triaj",
    interp.atinge_banii || schimbari.length === 0 ? "triajul e coerent cu schimbările" : "atinge_banii e false, dar sunt schimbări propuse",
  );

  schimbari.forEach((s: SchimbareInterpretata, i) => {
    const eticheteBune = Array.isArray(s.taguri) && s.taguri.length > 0 && s.taguri.every(esteTag);
    verif(
      eticheteBune,
      "taguri",
      eticheteBune
        ? "etichetele sunt din listă"
        : !s.taguri?.length
          ? "nicio etichetă: catalogul cere cel puțin una"
          : `etichete din afara listei: ${s.taguri.filter((t) => !esteTag(t)).join(", ")}`,
      i,
    );

    verif(STATUSURI.includes(s.status), "status", STATUSURI.includes(s.status) ? "status valid" : `status „${s.status}” (doar ${STATUSURI.join(", ")}; expirarea se scrie în pana_la)`, i);
    verif(DIRECTII.includes(s.directie), "directie", DIRECTII.includes(s.directie) ? "direcție validă" : `direcție necunoscută „${s.directie}”`, i);
    verif(INCREDERI.includes(s.incredere), "incredere", INCREDERI.includes(s.incredere) ? "încredere validă" : `încredere necunoscută „${s.incredere}”`, i);
    verif(!!s.rezumat_en?.trim(), "rezumat_en", s.rezumat_en?.trim() ? "titlul în engleză există" : "lipsește rezumat_en", i);

    // citatul
    const citatBun = !!s.citat && textNorm.includes(normalizeaza(s.citat));
    verif(citatBun, "citat", citatBun ? "citatul e în textul actului" : `citat negăsit în text: „${(s.citat ?? "").slice(0, 90)}”`, i);

    // sumă: formula scrisă de mână sau formula parametrizată
    if (s.formula != null) verif(esteFormula(s.formula), "formula", esteFormula(s.formula) ? "formula există" : `formulă inexistentă: ${s.formula}`, i);
    if (s.formula_tip != null) {
      const p = (s.formula_tip as { parametri?: { camp?: unknown; referinta?: unknown } }).parametri;
      const camp = p?.camp;
      const referinta = p?.referinta;
      const valida =
        esteFormulaTip(s.formula_tip) &&
        (camp === undefined || (typeof camp === "string" && Object.prototype.hasOwnProperty.call(CAMPURI_VALORI, camp))) &&
        (referinta === undefined || esteReferinta(referinta));
      verif(valida, "formula_tip", valida ? "formula_tip e validă" : `formula_tip invalidă, cu câmp sau referință necunoscută: ${JSON.stringify(s.formula_tip)}`, i);
      if (valida) {
        const r = parametriInText(s.formula_tip, textAct);
        verif(r.ok, "formula_tip_text", r.ok ? "numerele formulei sunt în text" : `numere negăsite în text: ${r.lipsa.join(", ")}`, i);
        avert(formulaCompleta(s.formula_tip), "formula_incompleta", formulaCompleta(s.formula_tip) ? "formula e completă" : "cota veche lipsește: o completează un om cu sursa", i);
      }
    }

    // calculabil: o schimbare activă cu bani trebuie să aibă o formulă, altfel nu putem spune câți lei
    if ((s.directie === "cost" || s.directie === "castig") && (s.pana_la == null || s.pana_la >= azi)) {
      const are = s.formula != null || s.formula_tip != null;
      calculabile.active_cu_bani++;
      const ft = s.formula_tip;
      const incompleta = s.formula == null && esteFormulaTip(ft) && !formulaCompleta(ft);
      const calculabila = (s.formula != null && esteFormula(s.formula)) || (esteFormulaTip(ft) && formulaCompleta(ft));
      if (calculabila) calculabile.cu_formula++;
      avert(
        are,
        "calculabil",
        !are
          ? "schimbare activă cu bani fără formulă: suma nu se poate calcula"
          : incompleta
            ? "calculabilă după ce un om completează cota veche"
            : "schimbarea are formulă",
        i,
      );
    }

    // condiții
    const conditiiRele: string[] = [];
    const numereLipsa: string[] = [];
    for (const c of s.conditii ?? []) {
      const campOk = c.camp === "varsta" || Object.prototype.hasOwnProperty.call(CAMPURI_VALORI, c.camp);
      if (!campOk || !OPERATORI.includes(c.op) || typeof c.valoare !== "number" || !Number.isFinite(c.valoare)) conditiiRele.push(JSON.stringify(c));
      else if (!numarInText(c.valoare, textAct)) numereLipsa.push(`${c.camp} ${c.op} ${c.valoare}`);
    }
    verif(conditiiRele.length === 0, "conditii", conditiiRele.length ? `condiții invalide: ${conditiiRele.join("; ")}` : "condițiile sunt valide", i);
    if (!conditiiRele.length && (s.conditii ?? []).length)
      verif(numereLipsa.length === 0, "conditii_numar", numereLipsa.length ? `numere de condiții negăsite în text: ${numereLipsa.join("; ")}` : "numerele condițiilor sunt în text", i);

    // date
    const dateRele = [
      !esteDataISO(s.in_vigoare_de_la) && `in_vigoare_de_la „${String(s.in_vigoare_de_la)}”`,
      s.pana_la != null && !esteDataISO(s.pana_la) && `pana_la „${String(s.pana_la)}”`,
      s.termen_actiune != null && !esteDataISO(s.termen_actiune) && `termen_actiune „${String(s.termen_actiune)}”`,
      ...(s.actiuni ?? []).map((a) => a.termen != null && !esteDataISO(a.termen) && `termen de acțiune „${String(a.termen)}”`),
    ].filter(Boolean);
    verif(dateRele.length === 0, "date", dateRele.length ? `date care nu sunt ISO: ${dateRele.join(", ")}` : "datele sunt ISO", i);

    // acțiuni: fiecare schimbare activă are cel puțin una
    const expirata = s.pana_la != null && esteDataISO(s.pana_la) && s.pana_la < azi;
    if (s.status === "in_vigoare" || s.status === "adoptat") {
      const are = (s.actiuni ?? []).length > 0 || expirata;
      verif(are, "actiune_lipsa", are ? "schimbarea activă are cel puțin o acțiune" : "schimbare activă fără nicio acțiune", i);
    }
    (s.actiuni ?? []).forEach((a, j) => {
      const unde = `acțiunea ${j + 1}`;
      verif(TIPURI_ACTIUNE.includes(a.tip as never), "actiune_tip", TIPURI_ACTIUNE.includes(a.tip as never) ? `${unde}: tip valid` : `${unde}: tip „${a.tip}”`, i);
      verif(CINE_APLICA.includes(a.cine_aplica as never), "actiune_cine", CINE_APLICA.includes(a.cine_aplica as never) ? `${unde}: cine_aplica valid` : `${unde}: cine_aplica „${a.cine_aplica}”`, i);
      if (a.tip === "nimic_pana_la") verif(!!a.termen, "actiune_termen", a.termen ? `${unde}: nimic_pana_la are termen` : `${unde}: nimic_pana_la fără termen`, i);
      if (a.destinatie != null)
        verif(esteDestinatie(a.destinatie), "actiune_destinatie", esteDestinatie(a.destinatie) ? `${unde}: destinație din listă` : `${unde}: destinație inexistentă „${a.destinatie}”`, i);
    });

    // text: fără URL-uri scrise de model, fără formulări interzise
    const tot = JSON.stringify(s);
    verif(!/https?:\/\//i.test(tot), "url", /https?:\/\//i.test(tot) ? "modelul a scris un URL" : "fără URL-uri scrise de model", i);
    // formulările interzise se caută doar în textele care ajung la om; `nota` e pentru revizor și poate spune „nu e garantat”
    const pentruOm = [s.rezumat, s.rezumat_en, s.niveluri?.zero, s.niveluri?.curios, s.niveluri?.expert, ...(s.actiuni ?? []).map((a) => a.text)].filter(Boolean).join("\n");
    const interzisa = INTERZISE.find((re) => re.test(pentruOm));
    verif(!interzisa, "interzise", interzisa ? `formulare interzisă: ${interzisa}` : "fără formulări interzise", i);
  });

  return { trecute, picate, avertismente, calculabile, ok: picate.length === 0 };
}
