# Session state

## Latest (29 oct 2026): logo + antet nou (PR #43), refăcut curat peste main 268a4977
- Doar schimbările de logo și interfață, fără asistentul din `codex/assistant-current-ui` (main are deja asistentul din feat/asistent, PR #44). Versiunea veche cu acel asistent: branch local `ui-logo-responsive-vechi`.
- Logo: components/Logo.tsx (buzunar --color-v3-logo, monedă --color-v3-pos), iconițe/OG în lib/marca.tsx.
- Antet: logo + nume în stânga; dreapta Pro + buton rotund de profil (components/MeniuProfil.tsx): cont, Etichetele mele, Adaugă un document, Planul meu, Vorbește cu asistentul (/profil#asistent), Temă închisă, Limba, Pro, Ieși din cont. „Profil” scos din bara de secțiuni.
- Asistent.tsx: #document / #etichete deschid formularul și derulează la el; #asistent arată conversația.
- /aplicatie pe telefon: nu mai are 807 px lățime (bilanț). og:image din AUTH_URL (pe Amplify arăta spre localhost:3000).
- Găzduirea e AWS Amplify (https://main.d35dxj4gdere6m.amplifyapp.com/); check-ul Vercel de pe PR e de ignorat.
- Neverificat: meniul în starea conectat / „Ieși din cont”; dacă AUTH_URL e setată în consola Amplify.

## Latest (29 oct 2026): branch `legi-pipeline` (worktree `.claude/worktrees/legi-pipeline`), pipeline-ul de ingestie fără om
- Branch nou din `main` (e74eb78d) cu `legi-ingest` inclus (merge 4c17e28d). Planul a ce lipsea: `docs/ingest-urmatorii-pasi.md`.
- Construit de 3 builderi (Sonnet), inspectat, nimic pushuit:
  - `legi:triaj --api` (Haiku, `lib/triaj-model.ts`): triajul candidaților din bază sau din fișiere, scrie `triaj.model` + `triat_da/triat_nu`.
  - `legi:interpreteaza` (`lib/lot.ts`, `lib/interpretare-api.ts`, `lib/importa-interpretare.ts`): interpretare prin API cu cache, verificări, upsert în `interpretari (propus)`; mod pe fișiere `--din/--out`; `--buget-usd`. Model implicit Sonnet 5.5 (`LEGI_MODEL_INTERPRETARE`).
  - `legi:zilnic` (`lib/zilnic.ts`): descopera `--reia` → triaj → interpreteaza, rând în `rulari` (sursa `zilnic`); `.github/workflows/legi-zilnic.yml` (cron 04:00 UTC, dispatch cu dry-run). Secretele le pune Andrei în GitHub.
- Verificat: tsc curat, 251 teste; lanțul pe fișiere cu Portalul real (7 id-uri, 1 candidat → Haiku „nu”, corect) și 2 acte interpretate prin API (ambele „nu atinge banii”, corect: HG de siguranță pe rețea, ordin a cărui schemă e în anexă lipsă).
- DEBLOCAT: tabelele există și sunt pline (parola e în `SUPABASE_DB_URL`). Pașii D sunt făcuți: 1.077 acte, cele 18 interpretări din `legi-ingest/scratch/lot` importate.
- Beneficii calculabile (Andrei: „build it all”): tipuri noi de formulă, referințe sursate, 7 câmpuri de profil, cota veche completată de om în admin, instrucțiuni v4, verificări soft; 295 teste. Detalii în `docs/ingest-urmatorii-pasi.md`. Rularea v4 pe cele 18 acte (`--reinterpreteaza`, Sonnet): în curs / de măsurat; Codul fiscal depășește 32k tokeni la răspuns.
- Sesiunea „Laws database population” (29 oct): triaj Haiku pe 71 candidați (8 da); interpretare Sonnet (instrucțiuni v3) pe toți cei 96 triat_da → 0 candidat, 0 triat_da în bază; 115 rânduri în `interpretari`, toate `propus`, nimic aprobat (aprobarea rămâne la om în /admin/acte, care arată 109). ≈ 39 acte noi ating banii: 14 trec toate verificările, restul pică doar „nicio etichetă” (nișe: exproprieri, agricultură, sănătate). Verificat de mână pe textul din bază: tichet de masă 45 lei, tichet de creșă 770 lei, cogenerare 0,0157 lei/kWh, Tezaur 6,50/7,00/7,50%. Cost ≈ 4,75 USD. Descoperirea după 315785: niciun act nou până la 315866; Portalul a căzut de 2 ori („fetch failed”). Captură `captures/legi-admin-live-109.jpg`.
- Catalog: Andrei a cerut „review them yourself and put them in”. Am revizuit cele 17 propuneri care trec poarta și nu erau în catalog; am aprobat 24 de schimbări din 9 acte (commit bf66810d) → 66 schimbări din 32 de acte, verificat pe /legi (captură `captures/legi-catalog-66-bursa-01.jpg`). Lăsate în /admin pentru demo: #32 (tarife semincere), #65/#67 (ordine doar cu titlu), #71, #82 (minimis, anexă lipsă), #89 (fizioterapeuți), #97 (hrana albine) plus cele 24 care pică poarta (etichete lipsă) și cele 10 deja în catalog. Legea 161/2026 sărită: restituirea TVA e deja în catalog.
- Nota modelului nu mai ajunge în ghidul pentru utilizatori (`spreGhid`); rămâne în interpretari și în /admin.
- Rularea v4 (Sonnet) pe cele 18: Codul fiscal, OUG 156/2024 și Legea 141/2025 depășesc 32k tokeni la răspuns (JSON tăiat); restul rulează la ≈ 2 min și ≈ 0,2 USD pe act. Măsurat la 16/18: 7 acte tăiate la max_tokens (cele mari, unde sunt banii), iar pe cele reușite v4 nu aduce formule în plus (v3 2/9 vs v4 2/13 schimbări active cu bani). Concluzie: v4 trebuie scurtat (niveluri mai scurte, `--max-tokens` mai mare) înainte de orice reinterpretare; propunerile v3 rămân cele valabile.
- Publicat (Andrei: „put it in the database and make it so its in prod”): `supabase:import` (66/66 în schimbari/ghid), main (PR #39) îmbinat în legi-pipeline, engleză pentru cele 24 de intrări noi (testele de acoperire EN de pe main), `next build` ok, main avansat la legi-pipeline și pushuit → producția e acum AWS Amplify pe main: https://main.d35dxj4gdere6m.amplifyapp.com/ (Andrei, 29 oct). Verificat live: /legi arată 68 rezultate (66 din catalog + 2 proiecte), bursa de merit prezentă; captură `captures/prod-amplify-legi-68-01.jpg`. descriere.andreidobrin.com dădea 523 la verificare.
- Capăt deschis (decizie de echipă): aprobarea scrie `data/catalog.json` pe disc; aplicația nu citește din Supabase, deci un act aprobat ajunge la utilizatori doar prin `supabase:sync` + commit + push pe main.


Updated: 2026-10-29 05:35
## Deploy descriere mutat pe main (29 oct 2026)
- main fast-forward la deploy-descriere și împins: origin/main = 17e7bd03 (include cele 18 commit-uri legi-ingest + deploy-ul Next.js). Scripturile din deploy/descriere/ spun acum `main`.
- RĂMAS: pe CT 107 config-ul încă are BRANCH=deploy-descriere (SSH spre Proxmox nu a mers din sesiune). De rulat: `ssh root@192.168.31.63 "pct exec 107 -- sed -i s/^BRANCH=.*/BRANCH=main/ /etc/descriere-deploy/config && pct exec 107 -- descriere-deploy"`. Apoi version.txt trebuie să arate 17e7bd03.

## Latest (29 oct 2026): cifrele din aplicația Next.js în Geist, nimic commitat
- Token nou `--font-num` (Geist) în `app/globals.css` (@theme), Geist adăugat în linkul de fonturi din `app/layout.tsx`. Utilitarul `font-num font-semibold tabular-nums` pe: suma din CardSchimbare, totalurile și cifrele din RevistaFlux, bara „Planul meu” (ListaFlux), prețul Pro (Abonare), cifrele din /legi, cazurile și „48.000 de lei” de pe acasă. Titlurile rămân Raleway; „mai ai X zile” rămâne text.
- tsc curat, 206 teste. Verificat: Geist încărcat (30 de elemente pe /legi), temă întunecată, telefon 375px fără scroll orizontal. Capturi `captures/v8-06-app-*-inainte-dupa.png`.

## Latest (29 oct 2026): cifrele din v6 în Geist, nimic commitat
- Andrei a ales Geist pentru cifre. `mockup/v6/index.html`: Geist 600, cifre tabulare pe totalurile din bilanț, sumele de pe rânduri și datele din coloanele de termene. Titlurile rămân Raleway, textul Inter. `v5/base.css` neatins (îl folosește și v5).
- Înainte/după: `captures/v8-05-v6-cifre-inainte-dupa.png`. 21 teste v6 trec. Aplicația Next.js nu e schimbată.

## Latest (29 oct 2026): widgeturi de impact în mockup/v6/widgets.html, nimic commitat
- Andrei nu vrea cifrele în Raleway („ceva mai profi”) și a cerut widgeturi tip dashboard: impactul și cât poate face, clar și rapid.
- `mockup/v6/widgets.html`: comparație de fonturi pentru cifre (Raleway acum, Inter Tight, IBM Plex Sans, Geist propus; clic schimbă toată pagina, `?font=`), comutator pe lună / pe an (`?per=an`), 5 widgeturi din datele v6: bilanț net (−784, +90, rămâi −694), termen apropiat (motorina, mereu pe lună), ce poți face după valoare, unde se duc banii, ce urmează (cronologie). Rândurile duc la `index.html?plan=premium&go=<id>`.
- Capturi: `captures/v8-01-widgeturi-desktop.png`, `captures/v8-02-widgeturi-phone.png`.
- Neconcordanță veche: `v5/common.js` are TODAY = 2026-10-28, antetul v6 scrie 29 oct.
- Deschis: Andrei alege fontul și ce widgeturi intră în „Pentru tine”.

## Latest (29 oct 2026): comutator Basic / Premium în mockup/v6, nimic commitat
- `mockup/v6/index.html`: butoane Basic | Premium în antet (pe telefon, pastilă fixă deasupra barei de jos). Premium = toate actele deblocate (suprascrie `F.getAccess`), fără blur, panoul „Deblocări gratuite” înlocuit cu „Premium activ · 15 lei/lună”. Ținut în localStorage `v6-plan`; `?plan=premium|basic` în URL are prioritate.
- 21 teste v6 trec (`node --test feed.test.js freemium.test.js`). Verificat în browser: desktop Basic/Premium, rând deschis în Premium, telefon 375px.
- ATENȚIE: mockup/v4, v5, v6 sunt netrackuite în git, deci nu există pe nicio ramură (nici main).

## Merge legi-ingest → deploy-descriere (29 oct 2026, 05:15)
- Fast-forward local: deploy-descriere = 89096cf3 (18 commits by Codex: ingestion, /admin/acte). NOT pushed (a push to deploy-descriere deploys live on CT 107).
- Uncommitted local work (v4-v6 mockups, voice, notifications, supabase, etc.) remains uncommitted; 4 overlapping files resolved by hand: package.json (union of scripts), .env.example (Codex), instructiuni.md (v3 + imperative action wording), this file.
- Checked: tsc clean, 202 tests, next build ok (in a separate copy; .next is shared with the dev server). The dev server on :3000 was restarted.

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
- 12/12 interpretări Sonnet (subagenți), 88 schimbări, 76 cu etichetă; copii în `eval/rezultate/sonnet-subagent-v3/legi/`.
  Spot-check Opus pe cele 5 campanii → corecturi aplicate, regulile 14–16 în instrucțiuni. Paritate API (Haiku, 0,019 USD)
  pe 3 loturi: aceeași formă și verificări (`eval/rezultate/haiku-api-v3/legi/`).
- Parcurgerea ultimelor 6 săptămâni (id 314500–315900) rulează în fundal în `--dry-run --dump scratch/sweep` (jurnal
  `scratch/sweep-log.txt`); la 05:35: 508 pagini, 0 erori. Triaj Haiku pe primii 125 de candidați: 43 da / 82 nu
  (`scratch/triaj/verdict-*.json`, aplicate în fișiere). 6 acte din parcurgere interpretate (3 cu schimbări).
- Rămas: după ce se termină parcurgerea, `legi:triaj --reevalueaza`, `--export` pentru candidații noi, triaj Haiku,
  `--aplica`; apoi, cu baza: `legi:incarca --din scratch/acte --din scratch/sweep`, `legi:importa`, aprobări în /admin/acte.

### BLOCAT: baza de date
`.env.local` are `SUPABASE_DB_URL` comentat, cu `[YOUR-PASSWORD]`. Fără el nu merg `legi:migreaza`, `legi:incarca`,
`legi:importa`, `legi:aproba` și pagina /admin/acte pe date reale. După ce Andrei pune parola (sau lipește
`supabase/acte.sql` în SQL Editor): `npm run legi:migreaza && npm run legi:incarca -- --din scratch/acte --din scratch/sweep
&& npm run legi:importa -- --model claude-sonnet-5-5 --driver subagent`.

### Corecturi la campanii (de spus lui Andrei)
- Prima de stabilitate (OUG 11/2026, art. 76^5) e doar pentru tineri NEET 16–29 ani înregistrați la agenție, nu pentru
  oricine la primul job.
- `cei_d` din catalog e cont de investiții, nu certificat energetic; art. 111 nu mai are prag de 450.000 lei din 2023.


## Final (29 oct 2026, 06:45, limită de utilizare atinsă)
- Parcurgerea 314500–315900 s-a încheiat în 3 rulări (jurnale în `eval/rezultate/triaj-2026-10-29/`): 1.065 acte, 0 erori,
  0 reîncercări; după 315411 id-urile au goluri mari (313 lipsă din 469), pragul de oprire e acum 200 la rând.
- Stări finale în `scratch/sweep`: 723 respinse de reguli, 96 triat_da, 178 triat_nu, 68 candidați netriați (loturile se fac
  cu `legi:triaj --din scratch/sweep --export scratch/triaj4`). Verdictele Haiku sunt în `eval/rezultate/triaj-2026-10-29/`.
- Blocat tot pe `SUPABASE_DB_URL`; pașii de după sunt mai sus. Nimic pushuit.
Updated: 2026-10-28 14:40

## Context
Hackathon Nexxt × Stripe "Rethinking Financial Futures" (Romania only). Product: **"Ce înseamnă pentru mine"**. Locked direction (v2, 28 Oct 2026, with Andrei): standalone app, no bank integrations, no Stripe for now; strictly financial impact across niches; profile = tags incl. work domain; onboarding by chat with an assistant (placeholder in mockup) with form fallback; feed of notifications, each item ends in lei/month + dated action + link to the law article + "te privește ca: tags"; statuses proiect / adoptat / în vigoare / termen depășit. Non-financial effects are a later step. Plan file (v1, partly superseded): `~/.claude/plans/make-a-mockup-based-effervescent-sutherland.md`.

## Done (session 1, this clone, branch `andrei`)
- v1 (committed 03243bc): 4-question profile → timeline → simulate → "Planul meu" bar; kept at `mockup/v1/index.html`.
- v2 `mockup/index.html`: notification overlay (hero = Pilon II payout, Legea 2/2026, applies 5 Jan 2027; header shows "5 ian 2026 · demo"), three tabs (Noutăți feed, Planul meu, Profil with tag chips + chat placeholder), 12 rules with verified act / MO ref / Portal Legislativ link / article / explanatory source / "verificat la", tag intersection drives the feed per persona (Andrei IT+SRL, Maria PFA HoReCa, Ion pensionar). TODAY = 2026-10-28. My edits on top of the builder: CTA uses window.scrollTo (scrollIntoView scrolled the embedding pane); `.imp .v.zero` 17px for "informativ".
- `docs/produs.md` / `docs/product.md` rewritten for v2 (tags, feed, notification, standalone, no Stripe, "Mai departe" for non-financial) + Sources table with legislatie.just.ro links and confidence per rule.
- `docs/research-v2.md`: researcher output (13 rows). Window 1 Sep–28 Oct 2026: no new act found, hence the Pilon II hero.
- Captures `captures/v2-0*.jpg` (phone 375px, RO and EN, Andrei and Maria, expanded Pilon II card with legal source, dividend card "deadline passed", profile tab). Verified in DOM: simulate toggle moves the bar (−11.248 → −11.048), 7 Portal Legislativ IDs match research, dividend switch disabled.
- Artifact of the mockup: https://claude.ai/artifact/TXdexkw3rpvSMaU25mHW4n (republish from mockup/index.html keeps the URL).

## Done (session 2, same clone)
- `mockup/descriere.html`: Romanian product description page for the jury (6 tag families incl. Domeniul meu, asistent/formular, LLM reads Monitorul Oficial, notificare → flux + Planul meu, standalone, no Stripe/bank), answers the 4 PDF points, criteria table, sources. Opening notification = Pilon II / Legea 2/2026 + Pilon III before 31 dec 2026.
- Domain tag now has a real example: OUG 156/2024 (MO 1334/31 dec 2024), IT/construcții/agricultură/ind. alimentară lose income-tax exemption from Jan 2025, ≈520 lei/lună at brut 8.000 (tax only; Pilon II part not verified). Demo set is now 8 acts.
- `docs/rethinking_financial_futures_hackathon_stripe.pdf` copied in and linked from the page. Served on port 8766 (`descriere` in launch.json). Capture: `captures/07-descriere-desktop.png`.

## Next step
- Andrei reviews v2 captures / artifact. Open decision: use the Claude API in the prototype for profile-tag extraction and MO classification (with cache fallback), which reverses the earlier "no API" choice.
- On approval → prototype (Vite + React + TS, rule engine with tests, tag matching, no Stripe) per plan file Slice 3, updated for v2.

## Open in tools
- Browser pane: http://localhost:8767 (preview "mockup-v2", absolute path to ./mockup; "mockup" on 8765 resolved against the old session folder). Port 8766 = session 2 description page.
- Branch: `andrei` on https://github.com/Voicu-Alex/runtime-terror-stripe, base `main`.

## Open questions for Andrei
- API in the prototype: yes/no, and whose key.
- Hero notification is my pick (Pilon II); change it if you want a cost figure in the first ten seconds (IT exemption −650 lei/lună is the biggest, but it dates from Jan 2025).

## Known deltas / not verified
- Article link text on the Pilon II card wraps to three lines; fine on phone, could be shortened.
- 1280px layout of v2 not captured (pane was narrow); column is max-width 680 like v1.
- Articles marked "de confirmat" (OUG 156/2024, Legea 239/2025, Cod fiscal art. 78) were not read in the act text; building-tax and construction figures are press-only.
- Haiku inspector not run (no browser tool); captures graded by the orchestrator.

## Design v3 (28 oct, după-amiază, clona lui Matei)
- **Ales: varianta F „Revistă · gri șobolan”** în `mockup/v3/index.html` (`?v=f`). Decizia și motivele: `docs/adr/0001-design-v3-revista-gri.md`. Înlocuiește v2 ca design de referință.
- Variantele A, B, C (sesiunea de design) și D (albastru), E (turcoaz) rămân în fișier pentru comparație; se trece între ele cu ←/→.
- Titlurile celor 12 acte au fost rescrise în limbaj clar (cu valoarea de dinainte acolo unde e confirmată), deci se schimbă în toate variantele.
- Capturi: `captures/v3-*` (inclusiv `v3-f-desktop-1280.png`, `v3-f-2-noutati-top.png`). Capturi pe telefon prin `mockup/frame.html` (Chrome headless pe Windows nu randează sub ~500px).
- Context: `docs/echipa/design-brief.md`, `docs/research-competitori.md` (concurenți, capturi în `captures/competitori/`).
- Încă de făcut: Planul meu / Profil / onboarding în stilul F; decizia despre marcajul „estimare” în listă.
- NIMIC din toate acestea nu e commitat încă.

## Latest (14:40)
- `mockup/index.html` (served on :8767 by the other session's server): added the "Exemplu real: OUG 156/2024..." note under the Domeniu group in the Profil tab (i18n key `pf.domainEx`, RO+EN). Capture: `captures/08-app-profil-domeniu-exemplu.jpg`. NOT committed yet; awaiting Andrei's go-ahead to commit + push to andrei and main.
- main was fast-forwarded to andrei at 19165ec and pushed.
- OUG 156/2024 cards (it_scutire, constructii_facilitati) now cite art. LXIV pct. 7 (abrogă Codul fiscal art. 60 pct. 2 / pct. 5 și 7), verified in the official text on legislatie.just.ro/293109 (applies from Jan 2025 income); "de verificat" chip removed from constructii; its secondary link switched to KPMG. Capture: captures/09-app-card-it-sursa.jpg. Branch: andrei-2.
- Open question: IT card in index.html says -650 lei/lună, descriere.html says ≈520 lei/lună (tax only, brut 8.000). Pick one number before the pitch.
- Servers running: :8765 (other session), :8766 (descriere, this repo root), :8767 (mockup/ folder).

## Latest (session 3, branch `andrei-flux`, worktree `.claude/worktrees/andrei-flux`)
- `andrei-2` and the main checkout belong to another agent: do not touch them.
- `andrei-flux` = origin/voicu (PR #12, Voicu's skeleton) + merge of main (fixes the .gitignore conflict that blocks PR #12) + issue #3 card. Earlier standalone version kept on local branch `andrei-flux-v1` (2f1ce59).
- Design reference is now `mockup/v3/index.html?v=f` (PR #13, ADR 0001). Card follows its list row: kicker, title, amount right, deadline, status + act. Levels: Zero = closed row, Curios = opened row, Expert = "Arată-mi legea".
- Added: `components/CardSchimbare.tsx`, `lib/card.ts` (+7 tests), `lib/persoane-demo.ts` (Andrei brut 8.000 → IT −520), `/flux?p=andrei|maria|ion` sorted by impact, Inter + Raleway fonts, "Flux" nav link, one_click = https://posf.ro/comparator on energy and gas actions.
- 28 tests pass, tsc clean, build green (needs network for Google Fonts).
- Captures: `captures/flux-00-ref-v3f-*` (reference) vs `captures/flux-01-*` (result).
- Not pushed. Open with Voicu: energy/gas formulas return null (shown "— de calculat"); Status lacks termen_depasit (derived in lib/card.ts); one_click is a bare URL (button label generic "Compară oferte"); catalog titles are not the rewritten v3 titles.
- Next: "Planul meu" toggle, `/notificare`, `/admin` + BroadcastChannel, then PR.

## Latest (session 3, 18:30, `andrei-flux`, local only)
- Merged origin/voicu 792924b (profile numbers, 7 tag families, 3 new acts, AI Act footer, 4 more test docs). 32 tests, tsc, build green.
- Voicu asked (PR #12 comment) to test the Portal SOAP API from a browser: works from browser AND from Node/curl here (200, no UA or honest UA, no spoofing). `Text` = base text, not consolidated. Written up in `docs/surse-de-date.md`.
- Catalog fixes from official text: alocatie_copii (Legea 61/1993 art. 3 via OUG 126/2021, 243 lei from 2022 indexed; 292 lei = press), varsta_pensionare (Legea 360/2023, MO 1089/4 dec 2023, art. 47, art. 167; annex 5 schedule TODO), alocatie_sustinere_familie: **Legea 277/2010 abrogated 1 ian 2024** by Legea 196/2016 art. 96 lit. b) → entry now cites Legea 196/2016 (VMI), thresholds TODO.
- Team blocker found: `origin/andrei-2` (other agent) has a full prototype on its OWN Next 16 skeleton (flux, admin, notificare, setari, documente, pipeline, 111 tests), colliding with Voicu's PR #12 (Next 15) and this branch. Needs a team decision on which skeleton wins. PR #12 still CONFLICTING with main (.gitignore), fixed only here.
- 19:00: pushed b1e3962 to origin/voicu (merge main → .gitignore conflict fixed, PR #12 now MERGEABLE/CLEAN; 25 tests, tsc ok). andrei-flux merged it, fonts moved from next/font to a <link> (next/font broke 2 of 4 builds on the Google download), demo personas got an_nastere/nr_copii (Maria no longer sees varsta_pensionare). andrei-flux pushed. Capture: captures/flux-02-lista-maria-375.jpg.
- andrei-2 is a separate part of the project (Andrei, 28 oct): leave it out.

## Latest (session 3, 19:30, branch `andrei-continut` from main 5471f11, local only)
- main now has PRs #9 #10 #11 #12 #14 merged. No open PRs.
- Wired: `lib/continut.ts` (+10 tests): Iasmina's content/niveluri.json → card levels (7 acts, explicit id map, sentences with TODO dropped); Haggy's business/parteneri.json → energy/gas suppliers under the ANRE comparator, alphabetical, utm, "partener" label only if affiliate; Chris's modal (content/modal-specialist.md + business/profesionisti.md table) with CECCAR / CCF registers verified on their sites. Catalog: pilon2_plata → "consultant fiscal", varsta_pensionare → null (no regulated pensions consultant, per Chris).
- Card: open row = Zero; "De ce?" = Curios; "Arată-mi legea" = Expert (Iasmina's text + sources). "Găsește un {profesie}" stays after a passed deadline.
- 42 tests, tsc, build green. Captures: captures/continut-0*.jpg.
- Gotcha: `next build` in the same folder breaks a running `next dev` (shared .next); stop dev or rm -rf .next and restart.
- Content conflicts to raise: gas action says "blochează un preț fix" but Iasmina/Chris say nothing to do until 31 mar 2027; child allowance title states 292 lei (press) as fact.
- 19:50: MISTAKE: ran `gh pr merge 15` assuming it was mine; #15 was Voicu's (same feature: Iasmina levels into catalog + Chris modal, no registry link). main stayed healthy (32 tests). Reconciled: kept Voicu's catalog (`specialist` field), my card + lib/continut now read `s.specialist`; varsta_pensionare profesionist → null. Merged my #16 (069a82a). main == andrei-continut, 42 tests, build ok, no open PRs. Voicu not told yet (needs Andrei's OK to comment).
- Lesson: always merge by the number `gh pr create` printed.
- 20:20: key in .env.local works. Route fixed for claude-opus-5-5 (forced tool_choice = 400 → output_config.format json_schema; no minimum/maximum on number; max_tokens 16000; refusal handled). Real API: 7-doc check 4/7, then 6/6 after prompt rules 7-8 (run stopped on Andrei's request).
- Andrei: test agent behaviour with Claude Code subagents, NOT the API key, until the app is ready. Subagent run (Opus, read-only, reading INSTRUCTIUNI_MODEL + SCHEMA_ANALIZA + one doc): 7/7 match scripts/verifica-test-docs.mjs expectations.
- Commit 44c9e50 on andrei-continut, local, not pushed. .env.local still holds the key: a real upload on /documente would call the API.
- 21:00: model eval (subagents, no API key): eval/ (descarca-acte.mjs, genereaza-documente.py, interpretare/instructiuni.md, scor.mjs, numara-actiuni.mjs, asteptari-*.json, legi/*.txt, rezultate/{sonnet,haiku}/). 13 docs (7 Voicu + 6 new) and 9 laws (3 golden, 4 new 2026, 2 negatives). Final: docs 13/13 both; laws all automatic checks pass both; Sonnet proposes more actions (6 vs 4). Fix round: rule 9 (bank statements: no tags). Write-up: docs/eval-modele.md. Recommendation: Haiku for docs + triage, Sonnet for interpretation (team decision; route still on claude-opus-5-5).
- 22:00: plan steps 1-4 implemented (Fable advisor reviewed design and result): data/destinatii.json + lib/destinatii.ts + scripts/verifica-destinatii.mjs (10/10 URLs); typed actions (tip/cine_aplica/destinatie) in lib/catalog.ts + validator, all 14 catalog actions typed; lib/formule-tip.ts (4 parametrized types, parametriInText) wired into potrivire; HG 146/2026 in catalog (diferenta_prag 4325, condiție brut ≥ 4050 from OUG 89/2025); Elena (fictional, salariu_minim, no brut) + components/Flux.tsx (typed values per persona in localStorage) + "spune-ne X" form on the card. Law prompt v2; re-run: active changes with action Haiku 3/15→15/15, Sonnet 5/12→11/11, destinations 11/11 and 8/8, formula numbers in text 4/4 and 1/1. 63 tests, tsc, build pass. Captures captures/pas1-*, pas4-*.
- Open for Andrei/team: add Elena to the persona list in CLAUDE.md (not edited); a "buying a home" tag (Sonnet left Legea 161 untagged); verify the 6 proposed destinations; gas action text conflict.
- 23:00: merged main (Matei's v3 F flux, ListaFlux/FluxMeu, RO/EN, ghid /legi, Ioana, cumpar_locuinta tag, 5 new acts) into andrei-continut; steps 1-4 re-applied on their structure. "Spune-ne X" lives in ListaFlux: demo → cipm.demo.<id>.valori, real profile → adaugaInProfil + salveazaProfil. Andrei decided: home-buying cards use cumpar_locuinta only (not chirias/proprietar). tva_locuinta: Legea 161/2026 as modificat_prin + refund action (from 1 oct 2026; ANAF order number not found → "de verificat"). Destinations: +anofm (verified), +scoala, +asociatia_proprietari; ANAF refund procedure and energy-poverty page not found. 94 tests, tsc, build pass; 11/11 destination URLs. Captures: captures/merge-0*.jpg. Local only, not pushed.
- Team note: tva_locuinta catalog entry says Legea 141/2025 (expired 2025) while its ghid entry describes the Legea 161 refund; the card header still shows "termen depășit".
- 23:45: real API test (Andrei asked). Laws via eval/interpreteaza-api.mjs: Haiku 5.5 and Sonnet 5.5 pass every automatic check on 9 acts; measured cost $0.04 vs $0.85. Documents via the real route (Opus 5.5), eval/documente-api.mjs: run 1 11/13 (salariu_net missing on payslips; 0/"" filler values that FormularProfil would have saved into the profile), fixed with nullable-required schema + curataValori; run 2 13/13 but a 0.05 "rural" on the gas bill, fixed with rule 10 + drop < 0.2; run 3 13/13 clean. 97 tests, tsc, build pass. Doc cost not measured (route doesn't log usage), est. ~$0.4/run.
## Latest (29 oct 2026, asistentul, worktree `.claude/worktrees/feat-asistent`, branch `feat/asistent` din main bbf6c747)
- Andrei a cerut: ce ar face un chatbot, cum se integrează, cum ajută la provocare. Propunere aprobată (plan: `~/.claude/plans/on-implementing-a-chatbot-breezy-hollerith.md`), executată cu /orchestrate (builderi Sonnet 5.5 medium, researcher/inspector Haiku 5.5 medium, advisor înainte de fiecare fază).
- Regula: modelul face doar două lucruri: text liber → etichete din `lib/taguri.ts` (schemă JSON cu enum) și explică un card din datele lui (catalog, ghid, niveluri, potrivire). Sumele vin doar din motor.
- Făcut (commit-uri pe `feat/asistent`, local, NEPUSH-UIT): `lib/asistent.ts` (6 întrebări din parcurs.md §2, mașină de stări, sare pasul 3 fără PFA/dividende, `redaDinTaguri`), `lib/demo-asistent.ts` (fără cheie: cuvinte-cheie → etichete; răspunsuri despre lege din niveluri/ghid/acțiuni), `lib/asistent-prompt.ts` (voce.md §9 + §7, bloc DATE), `app/api/asistent/route.ts` (profil → claude-haiku-5-5 json_schema; lege → claude-sonnet-5-5; fără cheie sau la eroare → demo; fără stocare), `components/Asistent.tsx` (pe `/profil` în locul formularului, „Prefer formularul” îl arată; `/profil?p=andrei` redă conversația; mod `lege` în `<dialog>` cu 3 întrebări sugerate), `CardSchimbare.tsx` buton „Întreabă”, `docs/asistent.md`, launch.json intrare `asistent` pe :3100. 134 teste, tsc curat. `next build` NU rulat (dev server pe .next).
- Capturi: `captures/asistent-01-*` (start, text liber cu chips „IT din «programator»”), `asistent-02-profil-andrei-phone-*` (conversația redată), `asistent-03-card-pilon2-intreaba-phone.jpg` (răspuns din date, link Portal).
- Lipsesc din worktree (necommitate în checkout-ul principal, ale altei sesiuni): `docs/voce.md`, `docs/date-personale.md`, `content/parcurs.md`. De făcut acolo după merge: rând nou în date-personale (text liber + profil + istoric → server → Anthropic doar cu cheie), voce.md §11 „nu adaugă un chat liber” → actualizat. Textele sunt în `docs/asistent.md`.
- Omis cu intenție: „Nu știu ce e Pilonul II” (fără sursă ASF). Deschis pentru echipă: Q&A pe card = Pro?; Haiku/Sonnet pe asistent. Ruta cu cheie reală NU a fost rulată.
- Enter în input trimite în ambele moduri (verificat în browser: „Am pensie și stau la casa mea” → chips „pensie din «pensie»”, „proprietate din «casa mea»”).
- Issue de deschis pentru Pro 3 (după OK-ul lui Andrei), titlu: „Asistentul: documentele și textele rămase”. Ce există: branch `feat/asistent` (cod, teste, `docs/asistent.md`, capturi). De făcut acolo: rând în `docs/date-personale.md`, `docs/voce.md` §11 (chatul există, mărginit la etichete și la datele cardului), explicația „Nu știu ce e Pilonul II” când apare sursa ASF, `app/page.tsx` încă prezintă încărcarea documentului ca singura cale de profil.
- Risc la merge: checkout-ul principal are modificări necommitate (altă sesiune) în `components/CardSchimbare.tsx`, `lib/i18n.ts`, `app/profil/page.tsx`, `components/FormularProfil.tsx`, `.claude/launch.json`, `.claude/session-state.md`; ramura asta atinge toate. Cine commite al doilea rezolvă conflictele.

## Latest (session 3, 22:10, 29 oct)
- 22:10 (29 oct): merged origin/main (#24-#26) into andrei-continut. Catalog merged per id: teammates' text + my typed actions; salariu_minim_2026 existed on both sides, kept their niveluri/rezumat/sursa_explicativa and my conditii (brut >= 4050), formula_tip, 2 typed actions, detailed articol. Ghid = main's. Typed the 21 new actions from main (ajutor_incalzire / saracie_energetica / burse without destination: no matching verified desk). CardSchimbare: "spune-ne X" form + destination button used bg-white, unreadable in the new dark mode -> theme tokens. 97 tests, tsc, build pass.

## Latest (29 oct 2026, direcții v4, main checkout, nimic commitat)
- Andrei a cerut „mockup-uri diferite desktop/telefon” și a ales „direcții vizuale noi” (nu fluxurile lipsă în stilul F). Doar explorare: referința rămâne v3 F până decide echipa.
- `mockup/v4/`: `index.html` (prezentare cu cadre desktop 1280 + telefon 375), `a-bon.html` (bon fiscal personal), `b-agenda.html` (foaie de calendar cu termenul, apoi ce urmează pe luni), `c-fir.html` (mesaje de la „prietenul care știe”, pe subiecte). Date comune în `data.js`, copiate din v3 (persona Andrei, 29 oct 2026), notificarea = Legea 202/2026 CEI-D.
- Parametri: `?notif=0` ascunde notificarea, `?still=1` oprește animația (panoul de browser în fundal o îngheață), `c-fir.html?open=1` deschide firul pe telefon.
- Servit pe :8765 (preview „mockup”). Capturi: `captures/v4-*.jpg`.
- Următorul pas: Andrei alege o direcție; apoi aceeași direcție pe tot fluxul (onboarding, paywall Pro → Google → Stripe Checkout, Planul meu, Profil).

## Latest (29 oct 2026, variante F v5, nimic commitat)
- Andrei: direcțiile v4 (Bon, Agenda, Fir) „arată destul de rău”. A cerut variante care îmbunătățesc designul existent (F) în moduri diferite. v4 rămâne pe disc, nefolosit.
- `mockup/v5/`: `index.html` (F de azi ca reper + cele trei variante, desktop 1280 și telefon 375), `base.css` + `common.js` (tokenii lui F, rânduri, detaliu, filtre, termene), `f1-clar.html` (o propoziție + listă grupată De făcut / Te costă deja / Urmează, doar lei/lună), `f2-bilant.html` (bilanț pe bară la scară, simularea mută totalul: −784 → −729 cu CEI-D + curent), `f3-prima-pagina.html` (deschide cu IT −520, termenele ca bandă de 3 cartonașe). Date din `mockup/v4/data.js`, cu TODAY suprascris la 28 oct ca în F.
- Critica lui F: trei unități (lei/an, lei/lună, lei pe 12 luni), articolul principal e cea mai mică sumă (+43 lei/an), etichete multe deasupra titlurilor, banda de cifre greu de citit.
- `?open=<id>` deschide un rând. Capturi: `captures/v5-*.jpg`. Servit pe :8765.
- Următorul pas: Andrei alege o variantă (sau combină), apoi se duce în `components/` + restul ecranelor.

## Latest (29 oct 2026, v6 „Pentru tine” + „Noutăți”, nimic commitat)
- Andrei a ales F2 (bilanțul sus). A cerut: fără simulare, barele roșii/verzi duc la lege și o deschid; panou „Pentru tine” + panou „Noutăți” (general, cu proiecte); filtre de stare (proiect, urmează, în vigoare, expirat) pe lângă categorii; căutare după text sau etichete.
- `mockup/v6/index.html` (folosește `../v5/base.css`, `../v4/data.js`, `../v5/common.js`) + `mockup/v6/noutati.js`. Parametri: `?tab=nou`, `?go=<id>` (sare la lege), `?open=`, `?nopen=`, `?q=`, `?st=`.
- Proiecte reale găsite pe 29 oct (doar surse de presă, textul oficial TODO): MF, proiect de HG 26 oct 2026, prelungirea accizei reduse la motorină + adaos plafonat 1 nov 2026–31 ian 2027 (financiarul.ro); Primăria Iași, taxe locale 2027 indexate 7,3%, cota 0,08% (stireadeiasi.ro). Restul „Noutăți” = actele recente din data/catalog.json, cu sursele lor.
- Proiectul motorinei e și în „Pentru tine” (stare Proiect, +3,5 lei/lună dacă se adoptă, exclus din bilanț).
- Capturi: `captures/v6-*`. Desktop prin Chrome headless (panoul de browser randa trunchiat cu fereastra ascunsă).

## Latest (29 oct 2026, v6 + niveluri din aplicație, nimic commitat)
- Andrei a cerut în v6, pe ambele panouri: „De ce?”, „Arată-mi legea” și „Ai o situație mai complicată? / Pregătește discuția cu un contabil”, ca în CardSchimbare.tsx; etichete simple („șofer”, nu „te privește ca șofer”); etichete pe toate legile din Noutăți; în Pentru tine doar etichetele care se aplică.
- `mockup/v6/continut.js` e generat de scriptul din scratchpad din data/catalog.json + content/niveluri.json + data/destinatii.json (17 acte, 15 cu „De ce?”, specialist la pilon2/dividend/micro). Proiectele (motorina_pr, n_iasi, n_motorina_pr) arată „textul oficial nu e încă publicat (TODO)” + sursa de presă.
- Noutăți: etichetele lui Andrei negre, restul conturate. Parametri noi: `?why=,law=,spec=<id>` pentru capturi.
- DE DISCUTAT: Andrei a zis „referral links cu contabili parteneri”. business/profesionisti.md (Chris) a decis fără comision de la profesioniști și link doar la registrul public (CECCAR / CCF); nu există parteneri în date. Am implementat varianta cu registrul; parteneri reali = decizie de echipă.
- Capturi: `captures/v7-*`.

## Deploy descriere.andreidobrin.com (29 oct 2026, 02:25)
- Pull-based: CT 107 `descriere` checks `main` every 3 min (systemd timer) and publishes `deploy/descriere/manifest.txt` files atomically. Docs: `deploy/descriere/README.md`.
- Code is on branch `deploy-descriere` (pushed), NOT merged into main. Local main reset to origin/main; checkout is on deploy-descriere.
- GitHub access: container key added to Andrei's own account ("descriere-deploy CT107 (homelab)"), read+write to all his repos; remove after hackathon. Tested: deploy pulled from GitHub branch, live = 26da94d, HTML byte-identical.
- TEMPORARY: server config (`/etc/descriere-deploy/config` on CT 107) has `BRANCH=deploy-descriere`, so pushes to that branch deploy. Live = 641cb7f. After merging into main, set it back: `sed -i s/^BRANCH=.*/BRANCH=main/ /etc/descriere-deploy/config`. Snapshot: `pre-deploy-20261029-021930`.

## Android (29 oct 2026, 05:30, sesiune Fable, nimic commitat)
- Andrei a întrebat ce unelte îi trebuie ca să implementez și să testez o aplicație Android pe un telefon simulat, apoi a cerut: repară ce lipsește, alege arhitectura care arată cel mai bine în pitch (dacă cea mai rapidă arată ca o aplicație curată cu notificări push, aceea), și scrie planul pentru un orchestrator Codex („Astra”) care folosește agenți mai mici, pe branch-ul `android` din `deploy-descriere`.
- Mediu reparat și verificat: `ANDROID_HOME`/`ANDROID_SDK_ROOT` + `platform-tools`, `emulator`, `cmdline-tools\latest\bin` pe PATH (utilizator); JDK 21 Temurin instalat (șablonul Capacitor 8 s-a construit cu el; cerința exactă neverificată în docs) și pus `JAVA_HOME` + primul pe PATH (mașină, prin UAC); JDK 17 rămâne; AVD nou `Pixel_6_API36_gpu` (GPU host pe RTX 4050, 3 GB RAM, boot 37 s headless; nu există profil Pixel 8 în SDK). Android Studio 2026.2.2 e în `C:\Program Files\Android\Android Studio`. Terminalele deschise înainte nu văd variabilele noi.
- Dovezi: `captures/android-emulator-boot.png` (AVD vechi, software), `captures/android-emulator-gpu-home.png` (ecranul de blocare Android 16 după boot pe AVD-ul nou), `.claude/worktrees/android/captures/android-01-capacitor-proba-serverurl.png` (APK Capacitor 8 de probă, construit cu Gradle 8.14.3 în 1 min 42 s, din scratchpad, nu din repo).
- Decizie propusă (nu adoptată): Capacitor 8 peste Next.js, WebView pe `http://10.0.2.2:3200` (dev server de pe laptop; aplicația nu e publicată nicăieri), notificare locală din `lib/notificari.ts`, FCM ca extindere blocată de Firebase. `docs/adr/0005-android-capacitor.md` (status propus) și `docs/android/plan.md` (tichete T0–T5 pentru Astra) sunt scrise în worktree-ul `.claude/worktrees/android` pe branch-ul `android`, necommitate.
- Branch-ul `android` a fost creat la 89096cf3 = vârful curent al `deploy-descriere`, care tocmai fusese avansat (fast-forward) pe `legi-ingest` de altă sesiune; include deci cele 18 commit-uri legi-ingest, nu doar deploy-ul (641cb7f1). De confirmat cu Andrei.
- Limită cunoscută: Google refuză OAuth în WebView; Pro se demonstrează pe web, pe telefon notificare → flux → card.

## Final (29 oct 2026, 06:45, limită de utilizare atinsă)
- Parcurgerea 314500–315900 s-a încheiat în 3 rulări (jurnale în `eval/rezultate/triaj-2026-10-29/`): 1.065 acte, 0 erori,
  0 reîncercări; după 315411 id-urile au goluri mari (313 lipsă din 469), pragul de oprire e acum 200 la rând.
- Stări finale în `scratch/sweep`: 723 respinse de reguli, 96 triat_da, 178 triat_nu, 68 candidați netriați (loturile se fac
  cu `legi:triaj --din scratch/sweep --export scratch/triaj4`). Verdictele Haiku sunt în `eval/rezultate/triaj-2026-10-29/`.
- Blocat tot pe `SUPABASE_DB_URL`; pașii de după sunt mai sus. Nimic pushuit.

## Latest (Chris, 29 oct ~01:30, branch `chris-demo`, PR #34, not merged)
- Pitch is a 3-min video in English (phase 1). Read `docs/pitch/README.md` first: script, slides advice, jury Q&A, Vercel to-dos, open decisions (Pro price 15 vs 49,99/299; IT −520 vs −650).
- Added: `PRO_DESCHIS_DEMO=1` (feed open for the jury, default off), rate limit on `/api/analiza-document` (lib/limita.ts), landing bilingual (components/Acasa.tsx), `text_en` on all 43 actions and `niveluri.zero_en` on all 42 acts, `/surse`, `/admin` (real Sonnet 5.5 proposals from eval/rezultate/sonnet-api → data/inbox-mo.json; approve shows the card live in other tabs via localStorage), PWA manifest + icons + OG image, `scripts/inregistreaza-demo.mjs` (records 7 scenes to captures/video/, needs `npm i --no-save playwright-core`).
- Vercel deploys only commits authored by Voicu (Hobby, private repo): only Voicu merges to main.
- 115 tests, tsc, build pass; Playwright sweep 13 pages × phone/desktop × light/dark: no horizontal overflow, no console errors. No Anthropic API calls made.
