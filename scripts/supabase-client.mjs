/**
 * Clientul Supabase pentru scripturi (import și sincronizare). Citește cheile din .env.local,
 * prin `node --env-file=.env.local`. Acceptă și numele noi de chei (publishable / secret),
 * și pe cele vechi (anon / service_role).
 */
import { createClient } from "@supabase/supabase-js";

export function clientSupabase({ scriere = false } = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cheie = scriere
    ? (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)
    : (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const lipsa = [];
  if (!url) lipsa.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!cheie) lipsa.push(scriere ? "SUPABASE_SECRET_KEY (sau SUPABASE_SERVICE_ROLE_KEY)" : "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sau NEXT_PUBLIC_SUPABASE_ANON_KEY)");
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
