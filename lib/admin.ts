/** Cine poate aproba interpretări în /admin/acte: adresele din ADMIN_EMAILS, separate prin virgulă. */
export function esteAdmin(email: string | null | undefined, lista: string | null | undefined): boolean {
  if (!email || !lista) return false;
  const e = email.trim().toLowerCase();
  return lista
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(e);
}

/**
 * Accesul la pagină și la acțiuni. Fără ADMIN_EMAILS, în dezvoltare (nu în producție) pagina e deschisă,
 * ca să se poată vedea local fără Google; în producție, lista goală înseamnă că nu intră nimeni.
 */
export function areAcces(email: string | null | undefined, lista: string | null | undefined, productie: boolean): boolean {
  if (!lista?.trim()) return !productie;
  return esteAdmin(email, lista);
}

/** Cota scrisă de om („10” sau „10,5”): număr finit și ≥ 0, altfel null. */
export function parseazaCota(text: string): number | null {
  const t = text.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Cota veche completată de revizor, din câmpurile `cota_veche_<i>` și `sursa_veche_<i>` ale formularului de aprobare.
 * Contează doar schimbările alese; dacă un câmp din pereche e completat, trebuie amândouă, iar cota un număr finit.
 */
export function completariDinFormular(
  formData: { get(nume: string): unknown },
  alese: number[],
): { completari: Record<number, { cota_veche: number; sursa_veche: string }>; eroare?: string } {
  const completari: Record<number, { cota_veche: number; sursa_veche: string }> = {};
  for (const i of alese) {
    const cota = String(formData.get(`cota_veche_${i}`) ?? "").trim();
    const sursa = String(formData.get(`sursa_veche_${i}`) ?? "").trim();
    if (!cota && !sursa) continue;
    const nr = parseazaCota(cota);
    if (!cota || !sursa) return { completari, eroare: `Schimbarea ${i}: completează și cota veche, și sursa (act, articol).` };
    if (nr == null) return { completari, eroare: `Schimbarea ${i}: cota veche trebuie să fie un număr, cel puțin 0.` };
    completari[i] = { cota_veche: nr, sursa_veche: sursa };
  }
  return { completari };
}
