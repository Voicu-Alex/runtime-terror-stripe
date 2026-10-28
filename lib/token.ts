import { createHmac, timingSafeEqual } from "node:crypto";

// Linkurile din emailuri (confirmarea contului, resetarea parolei), fără tabel în baza de date:
// conținutul e semnat cu AUTH_SECRET și expiră. Linkul de resetare poartă și o amprentă a parolei
// curente, deci nu mai merge după ce parola s-a schimbat (o singură folosință).

export type Scop = "confirmare" | "resetare";
type Continut = { scop: Scop; email: string; exp: number; amprenta?: string };

const VALABIL_MS: Record<Scop, number> = { confirmare: 24 * 3600_000, resetare: 30 * 60_000 };

function semnatura(date: string, secret: string): string {
  return createHmac("sha256", secret).update(date).digest("base64url");
}

/** Amprenta scurtă a hash-ului de parolă: se schimbă când se schimbă parola. */
export function amprenta(hashParola: string | null): string {
  return createHmac("sha256", "amprenta").update(hashParola ?? "").digest("base64url").slice(0, 16);
}

export function creeazaToken(scop: Scop, email: string, secret: string, opt: { amprenta?: string; acum?: number } = {}): string {
  const continut: Continut = { scop, email, exp: (opt.acum ?? Date.now()) + VALABIL_MS[scop], amprenta: opt.amprenta };
  const date = Buffer.from(JSON.stringify(continut)).toString("base64url");
  return `${date}.${semnatura(date, secret)}`;
}

/** Conținutul tokenului, dacă semnătura e bună, scopul e cel cerut și n-a expirat; altfel null. */
export function citesteToken(token: unknown, scop: Scop, secret: string, acum = Date.now()): Continut | null {
  if (typeof token !== "string") return null;
  const [date, sem] = token.split(".");
  if (!date || !sem) return null;
  const a = Buffer.from(sem);
  const b = Buffer.from(semnatura(date, secret));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const c = JSON.parse(Buffer.from(date, "base64url").toString()) as Continut;
    return c.scop === scop && typeof c.email === "string" && c.exp > acum ? c : null;
  } catch {
    return null;
  }
}
