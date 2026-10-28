import { NextResponse } from "next/server";
import { corpJson, eroare, secret } from "@/lib/cont-server";
import { FARA_BAZA, db, gasesteCont, schimbaParola } from "@/lib/db";
import { PAROLA_MINIM, cripteaza, parolaValida } from "@/lib/parola";
import { amprenta, citesteToken } from "@/lib/token";

export const runtime = "nodejs";

/** Parola nouă, din linkul de resetare. Linkul merge o singură dată: după schimbare, amprenta parolei nu mai e aceeași. */
export async function POST(req: Request) {
  const corp = await corpJson(req);
  if (!parolaValida(corp?.parola)) return eroare(`Parola trebuie să aibă cel puțin ${PAROLA_MINIM} caractere.`, 400);
  const s = secret();
  if (!db() || !s) return eroare(FARA_BAZA, 503);
  const t = citesteToken(corp?.token, "resetare", s);
  try {
    const cont = t ? await gasesteCont(t.email) : null;
    if (!t || !cont || t.amprenta !== amprenta(cont.parola)) {
      return eroare("Linkul nu mai e valabil. Cere altul de la „Ai uitat parola?”.", 400);
    }
    await schimbaParola(t.email, await cripteaza(corp!.parola as string));
    return NextResponse.json({ ok: true, email: t.email });
  } catch (e) {
    console.error("Resetare:", e instanceof Error ? e.message : e);
    return eroare("Nu am putut schimba parola. Încearcă din nou.", 502);
  }
}
