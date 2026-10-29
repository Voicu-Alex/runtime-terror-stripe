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
