import { NextResponse } from "next/server";
import { corpJson, eroare, secret } from "@/lib/cont-server";
import { FARA_BAZA, creeazaCont, db, gasesteCont } from "@/lib/db";
import { trimiteEmail } from "@/lib/email";
import { PAROLA_MINIM, cripteaza, emailValid, parolaValida } from "@/lib/parola";
import { amprenta, creeazaToken } from "@/lib/token";

export const runtime = "nodejs";

/**
 * Creează un cont cu email și parolă și trimite linkul de confirmare. Contul nu se poate folosi până nu e confirmat.
 * Răspunsul e același și dacă emailul are deja cont (atunci primește pe email un link de resetare), ca să nu se
 * poată afla ce emailuri sunt înscrise.
 */
export async function POST(req: Request) {
  const corp = await corpJson(req);
  const email = emailValid(corp?.email);
  if (!email) return eroare("Scrie o adresă de email validă.", 400);
  if (!parolaValida(corp?.parola)) return eroare(`Parola trebuie să aibă cel puțin ${PAROLA_MINIM} caractere.`, 400);
  const s = secret();
  if (!db() || !s) return eroare(FARA_BAZA, 503);

  const origine = new URL(req.url).origin;
  try {
    if ((await creeazaCont(email, await cripteaza(corp!.parola as string))) === "creat") {
      await trimiteEmail({
        catre: email,
        subiect: "Confirmă-ți contul",
        text: "Apasă butonul ca să-ți confirmi adresa de email. Linkul e valabil 24 de ore.",
        link: `${origine}/cont/confirma?token=${creeazaToken("confirmare", email, s)}`,
        buton: "Confirmă emailul",
      });
    } else {
      const cont = await gasesteCont(email);
      await trimiteEmail({
        catre: email,
        subiect: "Ai deja un cont",
        text: "Cineva (probabil tu) a încercat să-și facă un cont nou cu emailul ăsta, dar ai deja unul. Dacă ți-ai uitat parola, o poți schimba. Linkul e valabil 30 de minute.",
        link: `${origine}/cont/resetare?token=${creeazaToken("resetare", email, s, { amprenta: amprenta(cont?.parola ?? null) })}`,
        buton: "Schimbă parola",
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Înregistrare:", e instanceof Error ? e.message : e);
    return eroare("Nu am putut crea contul. Încearcă din nou.", 502);
  }
}
