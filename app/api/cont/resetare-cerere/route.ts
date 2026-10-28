import { NextResponse } from "next/server";
import { corpJson, eroare, secret } from "@/lib/cont-server";
import { FARA_BAZA, db, gasesteCont } from "@/lib/db";
import { trimiteEmail } from "@/lib/email";
import { emailValid } from "@/lib/parola";
import { amprenta, creeazaToken } from "@/lib/token";

export const runtime = "nodejs";

/** „Ai uitat parola?”: trimite linkul de resetare dacă există cont. Răspunsul e același oricum. */
export async function POST(req: Request) {
  const email = emailValid((await corpJson(req))?.email);
  if (!email) return eroare("Scrie o adresă de email validă.", 400);
  const s = secret();
  if (!db() || !s) return eroare(FARA_BAZA, 503);
  try {
    const cont = await gasesteCont(email);
    if (cont) {
      await trimiteEmail({
        catre: email,
        subiect: "Schimbă-ți parola",
        text: "Apasă butonul ca să alegi o parolă nouă. Linkul e valabil 30 de minute și merge o singură dată.",
        link: `${new URL(req.url).origin}/cont/resetare?token=${creeazaToken("resetare", email, s, { amprenta: amprenta(cont.parola) })}`,
        buton: "Alege o parolă nouă",
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Cerere resetare:", e instanceof Error ? e.message : e);
    return eroare("Nu am putut trimite emailul. Încearcă din nou.", 502);
  }
}
