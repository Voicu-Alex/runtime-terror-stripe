import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { FARA_CHEIE, clientDupaEmail, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Deschide portalul Stripe, unde omul își anulează Pro sau schimbă cardul. Clientul Stripe e al emailului de Google.
 * În modul test, portalul trebuie salvat o dată în Dashboard: Settings → Billing → Customer portal.
 */
export async function POST(req: Request) {
  const email = (await auth())?.user?.email;
  if (!email) return NextResponse.json({ eroare: "Conectează-te cu Google." }, { status: 401 });

  const s = stripe();
  if (!s) return NextResponse.json({ eroare: FARA_CHEIE }, { status: 503 });
  try {
    const client = await clientDupaEmail(s, email);
    if (!client) return NextResponse.json({ eroare: "Nu ai încă un abonament." }, { status: 404 });
    const portal = await s.billingPortal.sessions.create({ customer: client.id, return_url: `${new URL(req.url).origin}/abonament` });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("Stripe portal:", e instanceof Error ? e.message : e);
    return NextResponse.json({ eroare: "Nu am putut deschide portalul de abonament." }, { status: 502 });
  }
}
