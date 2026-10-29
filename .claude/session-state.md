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
