// Abonamentul Pro (docs/adr/0002-abonament-stripe.md): 15 lei pe lună, prin Stripe Checkout.
// Abonamentul se leagă de emailul contului Google (auth.ts); starea o citește serverul de la Stripe
// la fiecare verificare, deci anulările și plățile eșuate se văd imediat.

/** Prețul, în bani (15,00 lei). Stripe lucrează cu cea mai mică unitate a monedei. */
export const PRET_BANI = 1500;
export const MONEDA = "ron";

export type StareAbonament = {
  /** e conectat cu Google */
  conectat: boolean;
  email: string | null;
  activ: boolean;
  /** starea din Stripe: active, trialing, past_due, canceled, … */
  status: string | null;
  /** până când e plătită perioada curentă (ISO), dacă se știe */
  panaLa: string | null;
  /** se oprește la finalul perioadei (anulat din portal) */
  seOpreste: boolean;
  /** fluxul e deschis tuturor pentru demo (PRO_DESCHIS_DEMO=1 pe server); abonamentul rămâne separat */
  deschisDemo?: boolean;
};

export const FARA_ABONAMENT: StareAbonament = { conectat: false, email: null, activ: false, status: null, panaLa: null, seOpreste: false };

/** Ce stări din Stripe dau acces: plătit sau în perioada de probă. */
export function esteActiv(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/** Fluxul pe profilul tău se vede neestompat: cu Pro sau cât timp demo-ul e deschis. */
export function fluxDeschis(stare: StareAbonament | null): boolean {
  return !!stare && (stare.activ || !!stare.deschisDemo);
}

/** Comutatorul de demo, citit pe server: doar valoarea exactă „1” îl pornește. */
export function demoDeschis(valoare: string | undefined): boolean {
  return valoare === "1";
}
