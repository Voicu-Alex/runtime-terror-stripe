# Ingestia actelor: ce mai lipsește până la un sistem care merge singur

*Andrei cu Claude, 29 octombrie 2026. Branch `legi-pipeline` (din `main`, cu `legi-ingest` inclus).* Ce există e descris în
`docs/ingest.md`; aici e doar ce lipsește, în ordinea în care se face, și ce blochează.

## Unde suntem

| Pas | Stare | Dovada |
|---|---|---|
| Descoperire pe Portal (`legi:descopera`), politicoasă, cu cursor și jurnal | **Merge** în `--dry-run --dump`; modul cu bază de date nerulat | 1.065 acte în `scratch/sweep` (worktree `legi-ingest`), 0 erori |
| Triaj pe reguli (`lib/triaj-reguli.ts`) | **Merge** | 723 respinse / 342 candidați pe parcurgere |
| Triaj cu model (Haiku) | Doar manual: loturi `.md` pentru subagenți, verdicte `.json` aplicate pe fișiere | 96 da / 178 nu; 68 candidați netriați |
| Interpretare cu model | Doar manual (subagenți) sau script de evaluare (`eval/interpreteaza-api.mjs`, scrie în `eval/`) | 18 interpretări Sonnet în `scratch/lot` |
| Poarta cu verificări (`legi:importa`) → `interpretari (propus)` | Scris, nerulat pe bază | `--dry-run` trece |
| Aprobare `/admin/acte`, `legi:aproba` → `data/catalog.json` + `schimbari` | Scris, verificat doar cu `?demo=1` | capturi `captures/legi-admin-0*.png` |
| Tabelele `acte`, `interpretari`, `rulari`, `cursor_surse` în Supabase | **Nu există** | sondaj 29 oct: 404 „Could not find the table” |
| Rulare zilnică fără om | Nu există | — |

## Blocajul: baza de date

Scripturile vorbesc cu Supabase prin REST (cheia secretă din `.env.local`), dar tabelele se creează doar prin SQL.
Două căi, oricare merge, o singură dată:

1. Supabase → SQL Editor → New query → lipește `supabase/acte.sql` → Run; sau
2. completează parola în `SUPABASE_DB_URL` din `.env.local` (acum e `[YOUR-PASSWORD]`) și rulează `npm run legi:migreaza`.

Claude nu poate face niciuna: pagina Supabase cere autentificare, iar parola nu e în repo. Până atunci totul se
construiește și se testează în modul pe fișiere (`--dry-run`, `--din <dir>`), care există la fiecare pas.

## Feliile (în ordine; A, B, C se pot face în paralel, nu ating aceleași fișiere)

### A. Triajul cu model prin API (`legi:triaj --api`)
- `lib/triaj-model.ts`: instrucțiunile de triaj (regula 1 din `eval/interpretare/instructiuni.md`, reglate pe recall:
  când textul e tăiat, „de citit integral” = da), construirea lotului (titlu + primele 4.000 de caractere, câte 10 acte),
  parsarea verdictelor `{ "<id>": { "atinge_banii", "motiv" } }`, costul din `usage`.
- `scripts/legi/triaj.mts --api [--max 50] [--model claude-haiku-5-5] [--dry-run]`: din bază (stare `candidat`) sau din
  fișiere (`--din <dir> --api`). Scrie `acte.triaj.model` și `stare_procesare` → `triat_da` / `triat_nu`.
- Model: **claude-haiku-5-5** (eval: 9/9 la triaj, de 20 de ori mai ieftin).

### B. Interpretarea prin API ca pas de producție (`legi:interpreteaza`)
- `lib/lot.ts`: textul trimis modelului (antetul, articolele cerute, limita de 120.000 de caractere), scos din
  `export-lot.mts`, care îl refolosește.
- `lib/interpretare-api.ts`: promptul de sistem cu cache (instrucțiunile + fișierele la care trimit), apelul cu
  streaming, extragerea JSON-ului, costul; scos din `eval/interpreteaza-api.mjs`.
- `lib/importa-interpretare.ts`: verificările + upsert în `interpretari (propus)` + `acte.stare_procesare = interpretat`,
  scos din `importa-interpretari.mts`, care îl refolosește.
- `scripts/legi/interpreteaza.mts --stare triat_da [--max 10] [--ids …] [--model …] [--buget-usd 2] [--dry-run]`,
  plus modul pe fișiere `--din <dir lot> --out <dir>`.
- Model implicit: **claude-sonnet-5-5** (`LEGI_MODEL_INTERPRETARE` îl schimbă). Haiku a dat paritate pe setul de
  evaluare, dar scrie mai sărac la acțiuni; la ≈ 1.000 de acte pe an diferența e ≈ 85 USD. Decizia e marcată, nu finală.

### C. Rularea zilnică (`legi:zilnic`) și unde rulează
- `scripts/legi/zilnic.mts`: `descopera --reia --pana-la <cursor + 400> --max 400` → `triaj --api --max 100` →
  `interpreteaza --stare triat_da --max 20 --buget-usd 2` → rezumat pe stdout și un rând în `rulari` (sursa `zilnic`).
  Fiecare pas e un proces copil; un pas picat opreşte rularea cu cod ≠ 0 și rezumatul spune unde.
- `.github/workflows/legi-zilnic.yml`: cron 04:00 UTC + pornire manuală cu `dry-run`. Secrete de pus de Andrei în
  GitHub: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`. Prima rulare e `--dry-run --max 5`:
  Portalul a dat 403 de pe o rețea a echipei, deci întâi aflăm dacă runnerii GitHub au voie. Dacă nu: cron pe CT 107
  sau pe un calculator din echipă.

### D. Încărcarea muncii deja făcute (după ce există tabelele)
```bash
npm run legi:migreaza
npm run legi:incarca -- --din ../legi-ingest/scratch/acte --din ../legi-ingest/scratch/sweep   # 12 + 1.065 acte
npm run legi:importa -- --dir ../legi-ingest/scratch/lot --model claude-sonnet-5-5 --driver subagent  # 18 interpretări
# cursorul: ultimul id cu act real din parcurgere e 315776 (nu 315900: după 315411 id-urile au goluri)
```

### E. Capăt la capăt
`legi:zilnic --dry-run --max 3`, apoi cu baza: un act nou descoperit → triat → interpretat → apare în `/admin/acte`
(fără `?demo=1`) → aprobat → rând în `schimbari` + intrare în `data/catalog.json`.

## Capătul deschis: aprobarea nu ajunge la utilizatori

`lib/aprobare.ts` scrie `data/catalog.json` pe discul serverului și un rând în `schimbari`. Aplicația citește JSON-ul
importat static, deci pe un server deployat aprobarea se vede abia după `npm run supabase:sync` + commit + push pe
`main`. Citirea catalogului din Supabase pe server e amânată ca decizie de echipă în `docs/supabase.md`. Nu se
construiește în această rundă.

## Nu acum

- Anexele actelor (linkuri separate pe Portal): un act poate părea gol fără ele.
- Proiectele în consultare (SGG): `stare_legislativa = proiect`.
- Triajul Haiku lasă să treacă acte cu public foarte restrâns (despăgubiri de expropriere): poarta e omul din `/admin/acte`.
