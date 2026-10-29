# Session state

Updated: 2026-10-29 05:20

## Branch `legi-ingest` (worktree `.claude/worktrees/legi-ingest`, off `deploy-descriere`)

Ingestia actelor: Portal Legislativ → Supabase → interpretare (subagenți) → /admin/acte → catalog. Planul aprobat:
`~/.claude/plans/make-a-branch-off-spicy-llama.md`. Documentație: `docs/ingest.md`, `docs/surse-de-date.md` (sondarea).

### Făcut (commitat local, nepushuit)
- `supabase/acte.sql` (acte, interpretari, rulari, cursor_surse; recenzat de Opus), `scripts/legi/db.mjs`, `migreaza.mjs`
  (pg, TLS verificat, CA opțional `SUPABASE_DB_CA`).
- `lib/portal.ts` (parserul paginii de act, 4 fixturi reale), `lib/portal-client.ts` (1 cerere / 2 s, backoff, plafon;
  id lipsă = HTTP 500 cu pagina „Error”, numărat ca 404), `lib/triaj-reguli.ts`.
- `scripts/legi/descopera.mts` (`--ids`, `--de-la/--pana-la`, `--dry-run`, `--dump <dir>`, `--cauta-oug`),
  `export-lot.mts` (`--din <dir>` fără bază), `importa-interpretari.mts` (poarta cu verificări), `aproba.mts`,
  `respinge.mts`, `export-inbox.mts` (formatul PR #34), `incarca.mts` (dump → acte).
- `lib/interpretare.ts` (spreSchimbare/spreGhid), `lib/verificari-interpretare.ts`, `lib/aprobare.ts`,
  instrucțiuni v3 (+ regula 13: data intrării în vigoare dedusă din regula generală).
- `/admin/acte` (+ `?demo=1`), aprobare pe schimbare. Capturi `captures/legi-admin-0*.png`.
- 181 teste, tsc curat. Build neverificat.

### Rulat
- 12 acte (campanii + alese) aduse cu `--dry-run --dump scratch/acte`; loturi în `scratch/lot/` (Codul fiscal doar art.
  84, 84^1, 97, 155, 156, 170; Legea 239 art. XII–XIII; Legea 76 art. 33^1…76^5). OUG 8/2026 = Portal 307580.
- 11/12 interpretări Sonnet (subagenți) în `scratch/lot/portal_<id>.json`; poarta: 8 ok, 3 cu schimbări fără etichetă
  (cripto/titluri, TVA 21% general, asigurare voluntară de șomaj) care rămân neaprobabile. OUG 8/2026 încă rulează.
- Parcurgerea ultimelor 6 săptămâni (id 314500–315900) în `--dry-run --dump scratch/sweep`, jurnal `scratch/sweep-log.txt`.
- Paritate API (Haiku) pe 3 loturi: `scratch/lot-api/`. Spot-check Opus pe 5 interpretări: în curs.

### BLOCAT: baza de date
`.env.local` are `SUPABASE_DB_URL` comentat, cu `[YOUR-PASSWORD]`. Fără el nu merg `legi:migreaza`, `legi:incarca`,
`legi:importa`, `legi:aproba` și pagina /admin/acte pe date reale. După ce Andrei pune parola (sau lipește
`supabase/acte.sql` în SQL Editor): `npm run legi:migreaza && npm run legi:incarca -- --din scratch/acte --din scratch/sweep
&& npm run legi:importa -- --model claude-sonnet-5-5 --driver subagent`.

### Corecturi la campanii (de spus lui Andrei)
- Prima de stabilitate (OUG 11/2026, art. 76^5) e doar pentru tineri NEET 16–29 ani înregistrați la agenție, nu pentru
  oricine la primul job.
- `cei_d` din catalog e cont de investiții, nu certificat energetic; art. 111 nu mai are prag de 450.000 lei din 2023.

## Android (29 oct 2026, 05:30, sesiune Fable, nimic commitat)
- Andrei a întrebat ce unelte îi trebuie ca să implementez și să testez o aplicație Android pe un telefon simulat, apoi a cerut: repară ce lipsește, alege arhitectura care arată cel mai bine în pitch (dacă cea mai rapidă arată ca o aplicație curată cu notificări push, aceea), și scrie planul pentru un orchestrator Codex („Astra”) care folosește agenți mai mici, pe branch-ul `android` din `deploy-descriere`.
- Mediu reparat și verificat: `ANDROID_HOME`/`ANDROID_SDK_ROOT` + `platform-tools`, `emulator`, `cmdline-tools\latest\bin` pe PATH (utilizator); JDK 21 Temurin instalat (șablonul Capacitor 8 s-a construit cu el; cerința exactă neverificată în docs) și pus `JAVA_HOME` + primul pe PATH (mașină, prin UAC); JDK 17 rămâne; AVD nou `Pixel_6_API36_gpu` (GPU host pe RTX 4050, 3 GB RAM, boot 37 s headless; nu există profil Pixel 8 în SDK). Android Studio 2026.2.2 e în `C:\Program Files\Android\Android Studio`. Terminalele deschise înainte nu văd variabilele noi.
- Dovezi: `captures/android-emulator-boot.png` (AVD vechi, software), `captures/android-emulator-gpu-home.png` (ecranul de blocare Android 16 după boot pe AVD-ul nou), `.claude/worktrees/android/captures/android-01-capacitor-proba-serverurl.png` (APK Capacitor 8 de probă, construit cu Gradle 8.14.3 în 1 min 42 s, din scratchpad, nu din repo).
- Decizie propusă (nu adoptată): Capacitor 8 peste Next.js, WebView pe `http://10.0.2.2:3200` (dev server de pe laptop; aplicația nu e publicată nicăieri), notificare locală din `lib/notificari.ts`, FCM ca extindere blocată de Firebase. `docs/adr/0005-android-capacitor.md` (status propus) și `docs/android/plan.md` (tichete T0–T5 pentru Astra) sunt scrise în worktree-ul `.claude/worktrees/android` pe branch-ul `android`, necommitate.
- Branch-ul `android` a fost creat la 89096cf3 = vârful curent al `deploy-descriere`, care tocmai fusese avansat (fast-forward) pe `legi-ingest` de altă sesiune; include deci cele 18 commit-uri legi-ingest, nu doar deploy-ul (641cb7f1). De confirmat cu Andrei.
- Limită cunoscută: Google refuză OAuth în WebView; Pro se demonstrează pe web, pe telefon notificare → flux → card.
