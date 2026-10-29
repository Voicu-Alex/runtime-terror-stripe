# Supabase: catalogul de acte în baza de date

*Chris, 28 octombrie 2026.*

## Proiect configurat

- Nume: `ce-inseamna-pentru-mine`.
- [Dashboard](https://supabase.com/dashboard/project/ngzfoucfmnpvtdjctlkr).
- URL API: `https://ngzfoucfmnpvtdjctlkr.supabase.co`.
- Regiune: Frankfurt (`eu-central-1`), organizația existentă pe Free.
- Configurat și verificat la 29 octombrie 2026: 42 rânduri în `schimbari`,
  42 în `ghid`; importul local și citirea cu cheia publică funcționează, iar
  datele citite sunt identice cu fișierele din repo.
- RLS activ pe ambele tabele; `anon` și `authenticated` pot citi, dar nu pot
  insera, modifica sau șterge. Scriptul local de import folosește cheia
  `service_role` existentă, păstrată numai în `.env.local`.

## Ce stă în Supabase și ce nu

- **Da:** catalogul de acte (`data/catalog.json`, tabelul `schimbari`) și ghidul general (`data/ghid.json`, tabelul `ghid`).
- **Nu, în implementarea curentă:** profilurile. Salvarea lor folosește `localStorage`; aceasta nu înseamnă că documentele sau alte date nu sunt transmise extern. Promisiunea generală de procesare exclusiv locală a fost retrasă de Andrei la 29 octombrie 2026. Fluxurile actuale sunt în [Date personale](date-personale.md); stocarea pentru viitoarele alerte personalizate rămâne de proiectat.

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

## Rulare locală

Aplicația rulează în continuare cu `npm run dev`, la `http://127.0.0.1:3000`.
Conexiunea pentru scripturi stă în `.env.local`. Baza este în Supabase;
aplicația citește fișierele JSON sincronizate și funcționează și când baza nu răspunde.
Cheia secretă este folosită numai de scriptul local de import.

La crearea proiectului se poate dezactiva „Automatically expose new tables” și
activa „Enable automatic RLS”. Schema acordă explicit citire pe cele două tabele
rolurilor `anon` și `authenticated`, iar scriere numai rolului `service_role`.

## Pasul următor (după hackathon)

Citirea catalogului direct din Supabase, pe server, cu reîmprospătare periodică (de exemplu `revalidate` la câteva minute), cu JSON-ul ca rezervă dacă baza nu răspunde. Asta cere ca `CATALOG` să nu mai fie importat static în `lib/`, ci primit ca parametru de componente. E o refactorizare de făcut în echipă.
