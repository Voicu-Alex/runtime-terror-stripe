import { auth } from "@/auth";
import { stareDupaEmail, stripe } from "@/lib/stripe";

/**
 * Pe server: are cel conectat abonament Pro activ? Starea se citește de la Stripe, ca în /api/abonament/stare
 * (fără bază de date: Stripe e sursa de adevăr). Neconectat, fără cheie Stripe sau la eroare: false.
 */
export async function proActiv(): Promise<boolean> {
  const email = (await auth())?.user?.email;
  const s = stripe();
  if (!email || !s) return false;
  try {
    return (await stareDupaEmail(s, email)).activ;
  } catch (e) {
    console.error("Stripe stare (Pro):", e instanceof Error ? e.message : e);
    return false;
  }
}
