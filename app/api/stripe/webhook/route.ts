import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Evenimentele Stripe pentru abonament. Semnătura se verifică înainte de orice (STRIPE_WEBHOOK_SECRET).
 *
 * Accesul în aplicație nu depinde de webhook: starea abonamentului se citește de la Stripe la fiecare
 * verificare (app/api/abonament/stare), deci o anulare sau o plată eșuată se vede imediat. Aplicația
 * n-are încă bază de date, așa că aici doar confirmăm și jurnalizăm evenimentele. Înainte de lansare,
 * handlerul trebuie să scrie starea într-o bază de date (remindere, emailuri, contabilitate).
 */
const ABONAMENT = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);
const RISC = new Set(["charge.dispute.created", "charge.refunded", "radar.early_fraud_warning.created"]);

export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ eroare: "Webhook-ul nu e configurat." }, { status: 503 });

  const semnatura = req.headers.get("stripe-signature");
  if (!semnatura) return NextResponse.json({ eroare: "Lipsește semnătura Stripe." }, { status: 400 });

  let ev: Stripe.Event;
  try {
    // Corpul brut, exact cum l-a trimis Stripe: altfel semnătura nu se potrivește.
    ev = await s.webhooks.constructEventAsync(await req.text(), semnatura, secret);
  } catch (e) {
    console.error("Webhook Stripe respins:", e instanceof Error ? e.message : e);
    return NextResponse.json({ eroare: "Semnătură invalidă." }, { status: 400 });
  }

  switch (ev.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const sesiune = ev.data.object;
      // Plata e confirmată doar când sesiunea nu mai e „unpaid” (metodele cu confirmare întârziată).
      if (sesiune.payment_status !== "unpaid") console.info(`Abonament plătit: ${String(sesiune.subscription)}`);
      break;
    }
    case "checkout.session.async_payment_failed":
      console.warn(`Plata a eșuat pentru sesiunea ${ev.data.object.id}`);
      break;
    default:
      if (ABONAMENT.has(ev.type)) console.info(`Abonament: ${ev.type}`);
      else if (RISC.has(ev.type)) console.warn(`Risc pe abonament: ${ev.type}`);
  }
  return NextResponse.json({ primit: true });
}
