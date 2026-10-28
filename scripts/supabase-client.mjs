/**
 * Clientul Supabase pentru scripturi (import și sincronizare). Citește cheile din .env.local,
 * prin `node --env-file=.env.local`.
 *
 * Acceptă mai multe nume de variabile (cele noi, cele vechi, cu sau fără NEXT_PUBLIC_) și alege
 * cheia după tipul ei, nu după nume: „sb_secret_...” poate scrie, „sb_publishable_...” doar citește.
 */
import { createClient } from "@supabase/supabase-js";

const NUME_URL = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"];
const NUME_CHEI = [
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
];

/** Rolul unei chei: din prefixul cheilor noi sau din câmpul `role` al cheilor vechi (JWT). */
function rolCheie(cheie) {
  if (cheie.startsWith("sb_secret_")) return "secret";
  if (cheie.startsWith("sb_publishable_")) return "public";
  if (cheie.startsWith("eyJ")) {
    try {
      const rol = JSON.parse(Buffer.from(cheie.split(".")[1], "base64url").toString()).role;
      return rol === "service_role" ? "secret" : "public";
    } catch {
      return null;
    }
  }
  return null;
}

export function clientSupabase({ scriere = false } = {}) {
  const url = NUME_URL.map((n) => process.env[n]).find(Boolean);
  const chei = NUME_CHEI.map((n) => process.env[n]?.trim()).filter(Boolean);
  const secreta = chei.find((c) => rolCheie(c) === "secret");
  const publica = chei.find((c) => rolCheie(c) === "public");
  // scriptul de citire merge și cu cheia secretă (rulează local, nu în browser)
  const cheie = scriere ? secreta : (publica ?? secreta);

  const lipsa = [];
  if (!url) lipsa.push("SUPABASE_URL (sau NEXT_PUBLIC_SUPABASE_URL)");
  if (!cheie) lipsa.push(scriere ? "o cheie secretă (sb_secret_...), de exemplu în SUPABASE_SECRET_KEY" : "o cheie Supabase (sb_publishable_... sau sb_secret_...)");
  if (lipsa.length) {
    console.error(`Lipsesc din .env.local: ${lipsa.join(", ")}. Vezi docs/supabase.md.`);
    process.exit(1);
  }
  return createClient(url, cheie, { auth: { persistSession: false } });
}

/** Mesaj clar când tabelele nu există încă (schema.sql nerulată). */
export function explicaEroarea(eroare) {
  if (eroare?.code === "42P01" || eroare?.code === "PGRST205" || /does not exist|schema cache/i.test(eroare?.message ?? "")) {
    return "Tabelele nu există încă. Rulează supabase/schema.sql în Supabase (SQL Editor → New query → Run), apoi încearcă din nou.";
  }
  return eroare?.message ?? String(eroare);
}
