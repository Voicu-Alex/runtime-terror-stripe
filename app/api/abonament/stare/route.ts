import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { esteActiv, type StareAbonament } from "@/lib/abonament";
import { FARA_CHEIE, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stare(sub: Stripe.Subscription): StareAbonament & { id: string } {
  // Din versiunea basil, perioada curentă stă pe fiecare item al abonamentului.
  const sfarsit = sub.items.data[0]?.current_period_end;
  return {
    id: sub.id,
    activ: esteActiv(sub.status),
    status: sub.status,
    panaLa: sfarsit ? new Date(sfarsit * 1000).toISOString().slice(0, 10) : null,
    seOpreste: sub.cancel_at_period_end,
  };
}

/**
 * Starea abonamentului, citită de la Stripe la fiecare cerere (fără bază de date: Stripe e sursa de adevăr).
 * ?session_id=cs_… după întoarcerea din Checkout; ?sub=sub_… la fiecare deschidere a fluxului.
 */
export async function GET(req: Request) {
  const s = stripe();
  if (!s) return NextResponse.json({ eroare: FARA_CHEIE }, { status: 503 });

  const q = new URL(req.url).searchParams;
  const sesiuneId = q.get("session_id");
  const subId = q.get("sub");
  try {
    if (sesiuneId?.startsWith("cs_")) {
      const sesiune = await s.checkout.sessions.retrieve(sesiuneId, { expand: ["subscription"] });
      const sub = sesiune.subscription;
      // Plata e confirmată doar când sesiunea e completă și nu mai e „unpaid”.
      if (sesiune.status !== "complete" || sesiune.payment_status === "unpaid" || !sub || typeof sub === "string") {
        return NextResponse.json({ activ: false, status: sesiune.status, panaLa: null, seOpreste: false, id: null });
      }
      return NextResponse.json(stare(sub));
    }
    if (subId?.startsWith("sub_")) {
      return NextResponse.json(stare(await s.subscriptions.retrieve(subId)));
    }
    return NextResponse.json({ eroare: "Lipsește session_id sau sub." }, { status: 400 });
  } catch (e) {
    console.error("Stripe stare:", e instanceof Error ? e.message : e);
    return NextResponse.json({ activ: false, status: null, panaLa: null, seOpreste: false, id: null }, { status: 404 });
  }
}
