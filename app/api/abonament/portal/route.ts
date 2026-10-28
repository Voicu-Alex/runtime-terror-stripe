import { NextResponse } from "next/server";
import { FARA_CHEIE, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Deschide portalul Stripe, unde omul își anulează abonamentul sau schimbă cardul.
 * Clientul Stripe se află din abonament, nu dintr-un cont al nostru (nu avem conturi).
 * În modul test, portalul trebuie salvat o dată în Dashboard: Settings → Billing → Customer portal.
 */
export async function POST(req: Request) {
  const s = stripe();
  if (!s) return NextResponse.json({ eroare: FARA_CHEIE }, { status: 503 });

  let subId: unknown;
  try {
    ({ sub: subId } = await req.json());
  } catch {
    return NextResponse.json({ eroare: "Cererea trebuie să fie JSON cu câmpul „sub”." }, { status: 400 });
  }
  if (typeof subId !== "string" || !subId.startsWith("sub_")) return NextResponse.json({ eroare: "Lipsește abonamentul." }, { status: 400 });

  try {
    const sub = await s.subscriptions.retrieve(subId);
    const client = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const portal = await s.billingPortal.sessions.create({ customer: client, return_url: `${new URL(req.url).origin}/abonament` });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("Stripe portal:", e instanceof Error ? e.message : e);
    return NextResponse.json({ eroare: "Nu am putut deschide portalul de abonament." }, { status: 502 });
  }
}
