import type { CampValoare, Valori } from "./profil";

/**
 * Formule parametrizate: modelul alege tipul și copiază numerele din lege; calculul îl face codul.
 * Completează registrul scris de mână din lib/formule.ts pentru schimbări noi (praguri,
 * scutiri, sume fixe) fără o funcție nouă pentru fiecare act.
 *
 * Semn: rezultatul e negativ = cost, pozitiv = câștig, în lei pe lună (ca în lib/formule.ts).
 * Modelul dă doar mărimi; semnul sumei fixe vine din `directie` a schimbării, în cod.
 * Regula de încredere: fiecare număr nou din `parametri` trebuie să apară în textul actului
 * (`parametriInText`); altfel propunerea e respinsă înainte de /admin. Valoarea veche a unei cote
 * (de obicei nescrisă în actul nou) o dă un om, cu `sursa_veche`, și nu se caută în text.
 */
export type Perioada = "luna" | "an";

export type FormulaTip =
  /** o sumă fixă pe lună, scrisă în lege; semnul îl dă direcția */
  | { tip: "suma_fixa_lunar"; parametri: { lei: number } }
  /**
   * o cotă se schimbă și se aplică pe o valoare din profil (dividende, CASS). `camp` trebuie să fie
   * o bază fără taxa respectivă: pentru TVA pe cheltuieli (care includ deja TVA) rămâne formula scrisă
   * de mână din lib/formule.ts (2/119), altfel cele două căi dau cifre diferite.
   */
  | {
      tip: "schimbare_cota";
      parametri: { camp: CampValoare; cota_veche: number; cota_noua: number; perioada: Perioada; sursa_veche: string };
    }
  /** un prag minim crește: câștigul e cât lipsește valorii din profil până la prag */
  | { tip: "diferenta_prag"; parametri: { camp: CampValoare; prag: number; perioada: Perioada } }
  /** o sumă din profil devine scutită integral sau parțial (impozit pe clădiri, restituiri) */
  | { tip: "scutire"; parametri: { camp: CampValoare; procent: number; perioada: Perioada } };

export const TIPURI_FORMULA = ["suma_fixa_lunar", "schimbare_cota", "diferenta_prag", "scutire"] as const;

const peLuna = (x: number, p: Perioada) => (p === "an" ? x / 12 : x);
const rot = (x: number) => Math.round(x * 100) / 100;

/** Ce valoare din profil îi trebuie formulei, ca să o putem cere omului. */
export function necesita(f: FormulaTip): CampValoare[] {
  return f.tip === "suma_fixa_lunar" ? [] : [f.parametri.camp];
}

/** Impactul în lei pe lună, sau null când lipsește valoarea din profil. `directie` dă semnul sumei fixe. */
export function evalueazaTip(f: FormulaTip, v: Valori, directie: "cost" | "castig" | "termen" | "info" = "castig"): number | null {
  switch (f.tip) {
    case "suma_fixa_lunar":
      return rot((directie === "cost" ? -1 : 1) * Math.abs(f.parametri.lei));
    case "schimbare_cota": {
      const x = v[f.parametri.camp];
      if (x == null) return null;
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

/** Numerele unei formule care trebuie să apară în lege. Cota veche vine din alt act (`sursa_veche`). */
function numereDinLege(f: FormulaTip): number[] {
  switch (f.tip) {
    case "suma_fixa_lunar":
      return [Math.abs(f.parametri.lei)];
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
  if (!TIPURI_FORMULA.includes(f.tip as (typeof TIPURI_FORMULA)[number]) || !f.parametri) return false;
  const nr = (k: string) => typeof f.parametri![k] === "number" && Number.isFinite(f.parametri![k] as number);
  const per = () => f.parametri!.perioada === "luna" || f.parametri!.perioada === "an";
  const camp = () => typeof f.parametri!.camp === "string";
  switch (f.tip) {
    case "suma_fixa_lunar":
      return nr("lei");
    case "schimbare_cota":
      return camp() && nr("cota_veche") && nr("cota_noua") && per() && typeof f.parametri.sursa_veche === "string" && f.parametri.sursa_veche.length > 0;
    case "diferenta_prag":
      return camp() && nr("prag") && per();
    case "scutire":
      return camp() && nr("procent") && per();
  }
  return false;
}
