import postgres from "postgres";

// Baza de date a conturilor cu email (docs/adr/0003-conturi-email.md). Doar pe server.
// O singură tabelă: emailul, parola criptată și dacă emailul e confirmat. Profilul NU stă aici:
// rămâne pe dispozitiv. Abonamentul Pro stă la Stripe, găsit după email.

let sql: postgres.Sql | null = null;
let pregatit: Promise<unknown> | null = null;

export const FARA_BAZA = "Conturile cu email nu sunt configurate: lipsește DATABASE_URL în .env.local.";

export function db(): postgres.Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // ssl: „require” pe orice bază de pe internet (Neon, Vercel); fără, pentru Postgres-ul local de test.
  sql ??= postgres(url, { ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require", max: 3 });
  return sql;
}

/** Creează tabela la prima folosire (fără migrații separate pentru o singură tabelă). */
async function pregateste(s: postgres.Sql) {
  pregatit ??= s`
    create table if not exists conturi (
      email text primary key,
      parola text not null,
      confirmat boolean not null default false,
      creat timestamptz not null default now()
    )`;
  await pregatit;
}

export type Cont = { email: string; parola: string; confirmat: boolean };

export async function gasesteCont(email: string): Promise<Cont | null> {
  const s = db();
  if (!s) throw new Error(FARA_BAZA);
  await pregateste(s);
  const [c] = await s<Cont[]>`select email, parola, confirmat from conturi where email = ${email}`;
  return c ?? null;
}

/** Creează contul neconfirmat; dacă există deja neconfirmat, îi înlocuiește parola. Contul confirmat nu se atinge. */
export async function creeazaCont(email: string, parola: string): Promise<"creat" | "exista"> {
  const s = db();
  if (!s) throw new Error(FARA_BAZA);
  await pregateste(s);
  const r = await s`
    insert into conturi (email, parola) values (${email}, ${parola})
    on conflict (email) do update set parola = excluded.parola where conturi.confirmat = false
    returning email`;
  return r.length ? "creat" : "exista";
}

export async function confirmaCont(email: string): Promise<boolean> {
  const s = db();
  if (!s) throw new Error(FARA_BAZA);
  await pregateste(s);
  return (await s`update conturi set confirmat = true where email = ${email} returning email`).length > 0;
}

export async function schimbaParola(email: string, parola: string): Promise<boolean> {
  const s = db();
  if (!s) throw new Error(FARA_BAZA);
  await pregateste(s);
  // Resetarea prin email dovedește și că emailul e al omului, deci contul devine confirmat.
  return (await s`update conturi set parola = ${parola}, confirmat = true where email = ${email} returning email`).length > 0;
}
