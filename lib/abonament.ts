// Abonamentul (docs/adr/0002-abonament-stripe.md): 15 lei pe lună, prin Stripe Checkout.
// Aplicația n-are conturi, deci pe dispozitiv ținem doar ID-ul abonamentului; starea o cere
// serverul de la Stripe la fiecare verificare (anulări, plăți eșuate, reînnoiri se văd imediat).

/** Prețul, în bani (15,00 lei). Stripe lucrează cu cea mai mică unitate a monedei. */
export const PRET_BANI = 1500;
export const MONEDA = "ron";

const CHEIE = "cipm.abonament.v1";

export type StareAbonament = {
  activ: boolean;
  /** starea din Stripe: active, trialing, past_due, canceled, … */
  status: string | null;
  /** până când e plătit perioada curentă (ISO), dacă se știe */
  panaLa: string | null;
  /** se oprește la finalul perioadei (anulat din portal) */
  seOpreste: boolean;
};

/** Ce stări din Stripe dau acces: plătit sau în perioada de probă. */
export function esteActiv(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function incarcaAbonament(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = window.localStorage.getItem(CHEIE);
    return id && id.startsWith("sub_") ? id : null;
  } catch {
    return null;
  }
}

export function salveazaAbonament(id: string): void {
  try {
    window.localStorage.setItem(CHEIE, id);
  } catch {
    // storage blocat: abonamentul se verifică din nou la următoarea plată
  }
}

export function stergeAbonament(): void {
  try {
    window.localStorage.removeItem(CHEIE);
  } catch {
    // nimic de șters
  }
}
