import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { gasesteCont } from "@/lib/db";
import { emailValid, verifica } from "@/lib/parola";

/** Contul există, dar emailul nu e confirmat: formularul îi spune omului să-și verifice emailul. */
class Neconfirmat extends CredentialsSignin {
  code = "neconfirmat";
}

/**
 * Conectarea (Auth.js v5): cu Google sau cu un cont al aplicației (email și parolă, docs/adr/0003-conturi-email.md).
 * E nevoie de ea doar pentru Pro: abonamentul Stripe se leagă de email, ca să se regăsească pe orice dispozitiv.
 * Profilul rămâne doar pe dispozitiv; sesiunea e un JWT în cookie.
 * Variabile în .env.local: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, DATABASE_URL, RESEND_API_KEY.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      id: "parola",
      credentials: { email: {}, parola: {} },
      async authorize(c) {
        const email = emailValid(c?.email);
        if (!email || typeof c?.parola !== "string") return null;
        const cont = await gasesteCont(email);
        // Același răspuns pentru „nu există” și „parolă greșită”, ca să nu se poată afla ce emailuri au cont.
        if (!cont || !(await verifica(c.parola, cont.parola))) return null;
        // Doar emailurile confirmate: altfel cineva și-ar face cont pe emailul altcuiva și i-ar folosi abonamentul.
        if (!cont.confirmat) throw new Neconfirmat();
        return { id: email, email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/cont" },
});
