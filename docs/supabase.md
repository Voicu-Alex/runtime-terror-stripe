# Supabase: catalogul de acte în baza de date

*Chris, 28 octombrie 2026.*

## Ce stă în Supabase și ce nu

- **Da:** catalogul de acte (`data/catalog.json`, tabelul `schimbari`) și ghidul general (`data/ghid.json`, tabelul `ghid`).
- **Nu:** profilurile. Profilul rămâne pe telefon (`localStorage`), cum promite produsul (`CLAUDE.md`). Mutarea profilurilor pe server ar cere o decizie de echipă și o analiză GDPR.

Aplicația citește în continuare fișierele JSON. Supabase e locul unde editezi actele, iar `npm run supabase:sync` le aduce în fișiere. Așa demo-ul merge și fără internet, iar validarea și testele rămân aceleași.

## Configurare (o singură dată)

1. **Proiectul.** Creează un proiect pe supabase.com, în regiunea Frankfurt (UE).
2. **Cheile.** Din Project Settings → API Keys, completează `.env.local` în rădăcina proiectului (model în `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`: URL-ul proiectului;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: „Publishable key” (`sb_publishable_...`);
   - `SUPABASE_SECRET_KEY`: „Secret key” (`sb_secret_...`). Niciodată cu `NEXT_PUBLIC_` și niciodată în repo.

   Merg și numele vechi: `NEXT_PUBLIC_SUPABASE_ANON_KEY` și `SUPABASE_SERVICE_ROLE_KEY`.
3. **Tabelele.** În Supabase: SQL Editor → New query. Lipește conținutul din `supabase/schema.sql` și apasă Run. Rezultă tabelele `schimbari` și `ghid`, cu citire publică și scriere doar cu cheia secretă.
4. **Datele.** Rulează `npm run supabase:import`. Urcă cele 42 de acte și intrările din ghid. Comanda e idempotentă: o poți rula de mai multe ori fără dubluri.

## Lucrul de zi cu zi

- **Adaugi sau corectezi un act:**
  1. în Supabase, Table Editor → `schimbari`: editezi coloana `date` (JSON-ul intrării) sau adaugi un rând nou, cu `id`, `ordine` și `date`;
  2. adaugi intrarea corespunzătoare în `ghid`, altfel testele pică;
  3. rulezi `npm run supabase:sync`. Scriptul scrie fișierele JSON și rulează testele, care validează etichetele, formulele și ghidul. Dacă testele trec, faci commit și PR, ca de obicei.
- **Ai modificat direct fișierele JSON** (de exemplu printr-un PR al unui coleg): rulezi `npm run supabase:import`, ca baza să fie la zi.
- **Prima sincronizare** rescrie fișierele JSON într-o formatare uniformă (`JSON.stringify`). Diff-ul arată mare o singură dată, iar conținutul rămâne același.

## Pe Vercel

Deocamdată aplicația nu citește din Supabase în timpul rulării, deci pe Vercel nu trebuie nicio cheie Supabase. Când vom citi catalogul direct din Supabase (pasul următor), se adaugă în Project → Settings → Environment Variables doar `NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Cheia secretă nu merge pe Vercel.

## Pasul următor (după hackathon)

Citirea catalogului direct din Supabase, pe server, cu reîmprospătare periodică (de exemplu `revalidate` la câteva minute), cu JSON-ul ca rezervă dacă baza nu răspunde. Asta cere ca `CATALOG` să nu mai fie importat static în `lib/`, ci primit ca parametru de componente. E o refactorizare de făcut în echipă.
