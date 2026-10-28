import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { FARA_ABONAMENT } from "@/lib/abonament";
import { FARA_CHEIE, stareDupaEmail, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Starea Pro a celui conectat, citită de la Stripe la fiecare cerere (fără bază de date: Stripe e sursa de adevăr).
 * Neconectat: conectat = false. Abonamentul e al emailului de Google, deci se vede pe orice dispozitiv.
 */
export async function GET() {
  const sesiune = await auth();
  const email = sesiune?.user?.email;
  if (!email) return NextResponse.json(FARA_ABONAMENT);

  const s = stripe();
  if (!s) return NextResponse.json({ ...FARA_ABONAMENT, conectat: true, email, eroare: FARA_CHEIE }, { status: 503 });
  try {
    return NextResponse.json(await stareDupaEmail(s, email));
  } catch (e) {
    console.error("Stripe stare:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ...FARA_ABONAMENT, conectat: true, email }, { status: 502 });
  }
}
