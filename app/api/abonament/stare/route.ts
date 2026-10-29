import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { FARA_ABONAMENT, demoDeschis, type StareAbonament } from "@/lib/abonament";
import { FARA_CHEIE, stareDupaEmail, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Starea Pro a celui conectat, citită de la Stripe la fiecare cerere (fără bază de date: Stripe e sursa de adevăr).
 * Neconectat: conectat = false. Abonamentul e al emailului de Google, deci se vede pe orice dispozitiv.
 * Cu PRO_DESCHIS_DEMO=1, fluxul se vede pentru toți (juriul, demo-ul); plata și insigna Pro rămân ca înainte.
 */
export async function GET() {
  const deschisDemo = demoDeschis(process.env.PRO_DESCHIS_DEMO);
  const raspunde = (stare: StareAbonament & { eroare?: string }, status = 200) =>
    NextResponse.json({ ...stare, deschisDemo }, { status });

  const sesiune = await auth();
  const email = sesiune?.user?.email;
  if (!email) return raspunde(FARA_ABONAMENT);

  const s = stripe();
  if (!s) return raspunde({ ...FARA_ABONAMENT, conectat: true, email, eroare: FARA_CHEIE }, 503);
  try {
    return raspunde(await stareDupaEmail(s, email));
  } catch (e) {
    console.error("Stripe stare:", e instanceof Error ? e.message : e);
    return raspunde({ ...FARA_ABONAMENT, conectat: true, email }, 502);
  }
}
