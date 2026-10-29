import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Conectarea cu Google (Auth.js v5). E nevoie de ea doar pentru Pro: abonamentul Stripe se leagă de
 * emailul contului Google, ca să se regăsească pe orice dispozitiv. Sesiunea e un JWT în cookie.
 * Salvarea locală a profilului nu descrie toate fluxurile de date; vezi docs/date-personale.md.
 * Contul (intrare, cont nou, ieșire) e pe /conectare; acolo ajung și erorile conectării (`?error=`).
 * Variabile în .env.local: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/conectare", error: "/conectare" },
  session: { strategy: "jwt" },
});
