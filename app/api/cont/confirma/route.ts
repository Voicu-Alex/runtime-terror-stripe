import { NextResponse } from "next/server";
import { corpJson, eroare, secret } from "@/lib/cont-server";
import { FARA_BAZA, confirmaCont, db } from "@/lib/db";
import { citesteToken } from "@/lib/token";

export const runtime = "nodejs";

/** Confirmă emailul din linkul trimis la înregistrare (POST, ca un simplu GET pe link să nu schimbe nimic). */
export async function POST(req: Request) {
  const s = secret();
  if (!db() || !s) return eroare(FARA_BAZA, 503);
  const t = citesteToken((await corpJson(req))?.token, "confirmare", s);
  if (!t) return eroare("Linkul nu mai e valabil. Fă-ți contul din nou ca să primești altul.", 400);
  try {
    if (!(await confirmaCont(t.email))) return eroare("Contul nu există.", 404);
    return NextResponse.json({ ok: true, email: t.email });
  } catch (e) {
    console.error("Confirmare:", e instanceof Error ? e.message : e);
    return eroare("Nu am putut confirma contul. Încearcă din nou.", 502);
  }
}
