/**
 * Clientul Supabase pentru scripturile de ingestie (scripts/legi/*). Citește cheile din .env.local,
 * prin `node --env-file=.env.local`.
 *
 * Aceleași nume de variabile ca în docs/supabase.md (PR #30), ca să meargă cu același .env.local.
 * Cheia se alege după tipul ei, nu după nume: „sb_secret_...” sau un JWT cu rol service_role poate scrie,
 * „sb_publishable_...” / anon doar citește.
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

function rolCheie(cheie) {
  if (cheie.startsWith("sb_secret_")) return "secret";
  if (cheie.startsWith("sb_publishable_")) return "public";
  if (cheie.startsWith("eyJ")) {
    try {
      return JSON.parse(Buffer.from(cheie.split(".")[1], "base64url").toString()).role === "service_role" ? "secret" : "public";
    } catch {
      return null;
    }
  }
  return null;
}

/** @param {{ scriere?: boolean }} [optiuni] scriere=true cere cheia secretă. */
export function clientSupabase({ scriere = false } = {}) {
  const url = NUME_URL.map((n) => process.env[n]).find(Boolean);
  const chei = NUME_CHEI.map((n) => process.env[n]?.trim()).filter(Boolean);
  const secreta = chei.find((c) => rolCheie(c) === "secret");
  const publica = chei.find((c) => rolCheie(c) === "public");
  const cheie = scriere ? secreta : (publica ?? secreta);
  if (!url || !cheie) {
    const lipsa = [!url && "NEXT_PUBLIC_SUPABASE_URL", !cheie && (scriere ? "o cheie secretă (SUPABASE_SECRET_KEY sau SUPABASE_SERVICE_ROLE_KEY)" : "o cheie Supabase")].filter(Boolean);
    throw new Error(`Lipsesc din .env.local: ${lipsa.join(", ")}. Vezi docs/supabase.md.`);
  }
  return createClient(url, cheie, { auth: { persistSession: false } });
}

/** Mesaj clar când tabelele nu există încă. */
export function explicaEroarea(eroare) {
  if (eroare?.code === "42P01" || eroare?.code === "PGRST205" || /does not exist|schema cache/i.test(eroare?.message ?? "")) {
    return "Tabelele nu există încă. Rulează `npm run legi:migreaza` (sau supabase/acte.sql în SQL Editor), apoi încearcă din nou.";
  }
  return eroare?.message ?? String(eroare);
}

/** Aruncă o eroare cu mesaj clar dacă răspunsul Supabase are `error`. */
export function verifica({ data, error }, unde) {
  if (error) throw new Error(`${unde}: ${explicaEroarea(error)}`);
  return data;
}
