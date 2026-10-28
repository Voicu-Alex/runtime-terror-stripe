import Stripe from "stripe";
import { esteActiv, type StareAbonament } from "./abonament";

/**
 * Clientul Stripe, doar pe server (îl importă numai rutele din app/api). Cheia stă în .env.local (în .gitignore), niciodată în browser.
 * Recomandat: o cheie restricționată (rk_…) cu drepturi doar pe Checkout Sessions, Customers, Subscriptions,
 * Customer Portal și Prices; o cheie secretă (sk_…) merge și ea.
 * Fără versiune explicită: SDK-ul fixează versiunea de API cu care a fost publicat (2026-09-30.endive).
 */
let client: Stripe | null = null;

export function stripe(): Stripe | null {
  const cheie = process.env.STRIPE_SECRET_KEY;
  if (!cheie) return null;
  client ??= new Stripe(cheie);
  return client;
}

export const FARA_CHEIE = "Plata nu e configurată: lipsește STRIPE_SECRET_KEY în .env.local.";

/** Clientul Stripe al emailului de Google; îl creează doar când `creeaza` (la prima plată). */
export async function clientDupaEmail(s: Stripe, email: string, creeaza = false): Promise<Stripe.Customer | null> {
  const gasiti = await s.customers.list({ email, limit: 1 });
  if (gasiti.data[0]) return gasiti.data[0];
  return creeaza ? s.customers.create({ email }) : null;
}

/** Starea Pro a unui email: cel mai bun abonament al clientului (activ înaintea celor oprite). */
export async function stareDupaEmail(s: Stripe, email: string): Promise<StareAbonament> {
  const baza: StareAbonament = { conectat: true, email, activ: false, status: null, panaLa: null, seOpreste: false };
  const c = await clientDupaEmail(s, email);
  if (!c) return baza;
  const subs = await s.subscriptions.list({ customer: c.id, status: "all", limit: 10 });
  const sub = subs.data.find((x) => esteActiv(x.status)) ?? subs.data[0];
  if (!sub) return baza;
  // Din versiunea basil, perioada curentă stă pe fiecare item al abonamentului.
  const sfarsit = sub.items.data[0]?.current_period_end;
  return {
    ...baza,
    activ: esteActiv(sub.status),
    status: sub.status,
    panaLa: sfarsit ? new Date(sfarsit * 1000).toISOString().slice(0, 10) : null,
    seOpreste: sub.cancel_at_period_end,
  };
}
