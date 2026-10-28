import { NextResponse } from "next/server";
import { MONEDA, PRET_BANI } from "@/lib/abonament";
import { FARA_CHEIE, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Eticheta din Dashboard pentru fluxul ăsta de Checkout, cu sufixul de 8 litere cerut de Stripe. */
function eticheta(): string {
  const litere = Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
  return `cipm-abonament-lunar-${litere}`;
}

/**
 * Creează o sesiune Stripe Checkout pentru abonamentul lunar de 15 lei și întoarce linkul spre ea.
 * Metodele de plată vin din Dashboard (fără payment_method_types). Accesul se dă după confirmare,
 * din starea abonamentului citită de la Stripe (app/api/abonament/stare), nu din pagina de succes.
 */
export async function POST(req: Request) {
  const s = stripe();
  if (!s) return NextResponse.json({ eroare: FARA_CHEIE }, { status: 503 });

  const origine = new URL(req.url).origin;
  // Un preț creat în Dashboard (STRIPE_PRICE_ID) e de preferat; fără el, prețul se descrie aici.
  const pret = process.env.STRIPE_PRICE_ID;
  try {
    const sesiune = await s.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        pret
          ? { price: pret, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: MONEDA,
                unit_amount: PRET_BANI,
                recurring: { interval: "month" },
                product_data: { name: "Ce înseamnă pentru mine · abonament lunar" },
              },
            },
      ],
      locale: "ro",
      integration_identifier: eticheta(),
      success_url: `${origine}/abonament/gata?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origine}/abonament`,
    });
    return NextResponse.json({ url: sesiune.url });
  } catch (e) {
    console.error("Stripe checkout:", e instanceof Error ? e.message : e);
    return NextResponse.json({ eroare: "Nu am putut porni plata. Încearcă din nou." }, { status: 502 });
  }
}
