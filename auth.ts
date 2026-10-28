import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Conectarea cu Google (Auth.js v5). E nevoie de ea doar pentru Pro: abonamentul Stripe se leagă de
 * emailul contului Google, ca să se regăsească pe orice dispozitiv. Profilul rămâne în continuare
 * doar pe dispozitiv; pe server nu ținem nimic (sesiunea e un JWT în cookie).
 * Variabile în .env.local: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
});
