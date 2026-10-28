import Stripe from "stripe";

/**
 * Clientul Stripe, doar pe server (îl importă numai rutele din app/api). Cheia stă în .env.local (în .gitignore), niciodată în browser.
 * Recomandat: o cheie restricționată (rk_…) cu drepturi doar pe Checkout Sessions, Subscriptions,
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
