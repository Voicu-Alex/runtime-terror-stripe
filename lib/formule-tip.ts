import type { CampValoare, Valori } from "./profil";
import { esteReferinta, valoareReferinta, type ReferintaId, type Referinte } from "./referinte";

/**
 * Formule parametrizate: modelul alege tipul și copiază numerele din lege; calculul îl face codul.
 * Completează registrul scris de mână din lib/formule.ts pentru schimbări noi (praguri,
 * scutiri, sume fixe) fără o funcție nouă pentru fiecare act.
 *
 * Semn: rezultatul e negativ = cost, pozitiv = câștig, în lei pe lună (ca în lib/formule.ts).
 * Modelul dă doar mărimi; semnul sumelor vine din `directie` a schimbării, în cod.
 * Regula de încredere: fiecare număr nou din `parametri` trebuie să apară în textul actului
 * (`parametriInText`); altfel propunerea e respinsă înainte de /admin. Valoarea veche a unei cote
 * (de obicei nescrisă în actul nou) o dă un om, cu `sursa_veche`, și nu se caută în text; până atunci
 * e `null` și formula e incompletă (`formulaCompleta`). Valoarea unei referințe (salariul minim) vine
 * din data/referinte.json, după data calculului.
 */
export type Perioada = "luna" | "an";

export type FormulaTip =
  /** o sumă fixă pe lună, scrisă în lege; semnul îl dă direcția */
  | { tip: "suma_fixa_lunar"; parametri: { lei: number } }
  /** o sumă fixă scrisă în lege pe lună sau pe an; semnul îl dă direcția, rezultatul e în lei pe lună */
  | { tip: "suma_fixa"; parametri: { lei: number; perioada: Perioada } }
  /**
   * procent din valoarea din profil: `procent% × min(plafon, max(0, camp − peste))` pe `perioada`. `peste` și `plafon`
   * sunt în aceeași unitate și perioadă ca `camp`. Semnul vine din `directie`.
   */
  | { tip: "procent_din_camp"; parametri: { camp: CampValoare; procent: number; perioada: Perioada; peste?: number; plafon?: number } }
  /**
   * procent dintr-un multiplu al unei valori de referință din alt act (CASS 10% din 6 salarii minime pe an):
   * `procent% × multiplu × valoarea referinței` pe `perioada`. Nu cere nimic din profil. Semnul vine din `directie`.
   */
  | { tip: "multiplu_referinta"; parametri: { referinta: ReferintaId; multiplu: number; procent: number; perioada: Perioada } }
  /**
   * o cotă se schimbă și se aplică pe o valoare din profil (dividende, CASS). `camp` trebuie să fie
   * o bază fără taxa respectivă: pentru TVA pe cheltuieli (care includ deja TVA) rămâne formula scrisă
   * de mână din lib/formule.ts (2/119), altfel cele două căi dau cifre diferite.
   * `cota_veche` și `sursa_veche` sunt ambele `null` când vechea cotă nu e în text: un om le completează.
   */
  | {
      tip: "schimbare_cota";
      parametri: {
        camp: CampValoare;
        cota_veche: number | null;
        cota_noua: number;
        perioada: Perioada;
        sursa_veche: string | null;
      };
    }
  /** un prag minim crește: câștigul e cât lipsește valorii din profil până la prag */
  | { tip: "diferenta_prag"; parametri: { camp: CampValoare; prag: number; perioada: Perioada } }
  /** o sumă din profil devine scutită integral sau parțial (impozit pe clădiri, restituiri) */
  | { tip: "scutire"; parametri: { camp: CampValoare; procent: number; perioada: Perioada } };

export const TIPURI_FORMULA = [
  "suma_fixa_lunar",
  "schimbare_cota",
  "diferenta_prag",
  "scutire",
  "suma_fixa",
  "procent_din_camp",
  "multiplu_referinta",
] as const;

/** Data de azi (YYYY-MM-DD) după calendarul din București, nu UTC. */
const aziBucuresti = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Bucharest" }).format(new Date());

const peLuna = (x: number, p: Perioada) => (p === "an" ? x / 12 : x);
const rot = (x: number) => Math.round(x * 100) / 100 + 0; // + 0: fără -0

/** Fals doar pentru o `schimbare_cota` cu vechea cotă nesursată: un om o completează înainte să se poată calcula. */
export function formulaCompleta(f: FormulaTip): boolean {
  return f.tip !== "schimbare_cota" || f.parametri.cota_veche != null;
}

/** Ce valoare din profil îi trebuie formulei, ca să o putem cere omului. */
export function necesita(f: FormulaTip): CampValoare[] {
  return "camp" in f.parametri ? [f.parametri.camp] : [];
}

export type OptiuniEvaluare = {
  /** implicit data/referinte.json */
  referinte?: Referinte;
  /** data (ISO) pentru care se caută valoarea de referință; implicit azi */
  la?: string;
};

/**
 * Impactul în lei pe lună, sau null când lipsește valoarea din profil, valoarea de referință la data `la` ori vechea cotă.
 * `directie` dă semnul sumelor fixe, al procentelor și al multiplilor.
 */
export function evalueazaTip(
  f: FormulaTip,
  v: Valori,
  directie: "cost" | "castig" | "termen" | "info" = "castig",
  optiuni: OptiuniEvaluare = {},
): number | null {
  const semn = directie === "cost" ? -1 : 1;
  switch (f.tip) {
    case "suma_fixa_lunar":
      return rot(semn * Math.abs(f.parametri.lei));
    case "suma_fixa":
      return rot(semn * peLuna(Math.abs(f.parametri.lei), f.parametri.perioada));
    case "procent_din_camp": {
      const x = v[f.parametri.camp];
      if (x == null) return null;
      const baza = Math.min(f.parametri.plafon ?? Infinity, Math.max(0, x - (f.parametri.peste ?? 0)));
      return rot(semn * peLuna((baza * Math.abs(f.parametri.procent)) / 100, f.parametri.perioada));
    }
    case "multiplu_referinta": {
      const ref = valoareReferinta(f.parametri.referinta, optiuni.la ?? aziBucuresti(), optiuni.referinte);
      if (ref == null) return null;
      return rot(semn * peLuna((Math.abs(f.parametri.procent) * Math.abs(f.parametri.multiplu) * ref) / 100, f.parametri.perioada));
    }
    case "schimbare_cota": {
      const x = v[f.parametri.camp];
      if (x == null || f.parametri.cota_veche == null) return null;
      return rot(-peLuna((x * (f.parametri.cota_noua - f.parametri.cota_veche)) / 100, f.parametri.perioada));
    }
    case "diferenta_prag": {
      const x = v[f.parametri.camp];
      if (x == null) return null;
      return rot(peLuna(Math.max(0, f.parametri.prag - x), f.parametri.perioada));
    }
    case "scutire": {
      const x = v[f.parametri.camp];
      if (x == null) return null;
      return rot(peLuna((x * f.parametri.procent) / 100, f.parametri.perioada));
    }
  }
}

/**
 * Numerele unei formule care trebuie să apară în lege. Cota veche vine din alt act (`sursa_veche`), iar valoarea
 * unei referințe (salariul minim) stă în alt act: nu se caută niciuna în text.
 */
export function numereDinLege(f: FormulaTip): number[] {
  switch (f.tip) {
    case "suma_fixa_lunar":
    case "suma_fixa":
      return [Math.abs(f.parametri.lei)];
    case "procent_din_camp":
      return [f.parametri.procent, f.parametri.peste, f.parametri.plafon].filter((n): n is number => n != null);
    case "multiplu_referinta":
      return [f.parametri.multiplu, f.parametri.procent];
    case "schimbare_cota":
      return [f.parametri.cota_noua];
    case "diferenta_prag":
      return [f.parametri.prag];
    case "scutire":
      return f.parametri.procent === 100 ? [] : [f.parametri.procent]; // scutirea integrală nu are un procent scris
  }
}

/** Formele în care un număr apare într-un text românesc: 4325, 4.325, 4 325, 2,5. */
export function formeNumar(n: number): string[] {
  const [int, dec] = String(n).split(".");
  const cuPuncte = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const cuSpatii = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const forme = [int, cuPuncte, cuSpatii];
  return dec ? forme.map((f) => `${f},${dec}`) : forme;
}

/** Fiecare număr al formulei apare ca număr întreg (nu ca parte din alt număr) în textul actului. */
export function parametriInText(f: FormulaTip, text: string): { ok: boolean; lipsa: number[] } {
  const lipsa = numereDinLege(f).filter(
    (n) =>
      !formeNumar(n).some((forma) => {
        const esc = forma.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(?<![\\d.,])${esc}(?![\\d]|[.,]\\d)`).test(text);
      }),
  );
  return { ok: lipsa.length === 0, lipsa };
}

export function esteFormulaTip(x: unknown): x is FormulaTip {
  if (!x || typeof x !== "object") return false;
  const f = x as { tip?: unknown; parametri?: Record<string, unknown> };
  if (!TIPURI_FORMULA.includes(f.tip as (typeof TIPURI_FORMULA)[number]) || !f.parametri || typeof f.parametri !== "object") return false;
  const p = f.parametri;
  const numar = (x: unknown) => typeof x === "number" && Number.isFinite(x);
  // mărimile din lege sunt finite și ≥ 0; semnul vine din `directie`
  const pozitiv = (x: unknown) => numar(x) && (x as number) >= 0;
  const nr = (k: string) => pozitiv(p[k]);
  const optional = (k: string) => p[k] == null || pozitiv(p[k]);
  const per = () => p.perioada === "luna" || p.perioada === "an";
  const camp = () => typeof p.camp === "string";
  switch (f.tip) {
    case "suma_fixa_lunar":
      return nr("lei");
    case "suma_fixa":
      return nr("lei") && per();
    case "procent_din_camp":
      return camp() && nr("procent") && per() && optional("peste") && optional("plafon");
    case "multiplu_referinta":
      return esteReferinta(p.referinta) && nr("multiplu") && nr("procent") && per();
    case "schimbare_cota": {
      const amandouaSetate = pozitiv(p.cota_veche) && typeof p.sursa_veche === "string" && p.sursa_veche.length > 0;
      const amandouaNule = p.cota_veche === null && p.sursa_veche === null;
      return camp() && nr("cota_noua") && per() && (amandouaSetate || amandouaNule);
    }
    case "diferenta_prag":
      return camp() && nr("prag") && per();
    case "scutire":
      return camp() && nr("procent") && per();
  }
  return false;
}
