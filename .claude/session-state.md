# Session state

Updated: 2026-10-29 05:35

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
