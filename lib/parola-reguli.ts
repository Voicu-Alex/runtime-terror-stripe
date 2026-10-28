// Regulile contului cu email, fără dependențe de server: le folosesc și formularul, și rutele.

export const PAROLA_MINIM = 8;

/** Emailul, normalizat; null dacă nu arată a email. */
export function emailValid(x: unknown): string | null {
  if (typeof x !== "string") return null;
  const e = x.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254 ? e : null;
}

export function parolaValida(x: unknown): x is string {
  return typeof x === "string" && x.length >= PAROLA_MINIM && x.length <= 200;
}
