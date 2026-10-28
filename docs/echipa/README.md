# Echipa: skill-uri și coordonarea celor 6 instanțe Claude

Pentru: Claude-ul Max care face orchestrarea (Max 1). Citește tot, apoi fă pașii din secțiunea 5, în ordine. Restul instanțelor citesc doar secțiunile 3 și 4.

Echipa: 6 conturi Claude în paralel, 2 Max și 4 Pro, pe `Voicu-Alex/runtime-terror-stripe`. Conturile sunt pe calculatoare diferite și nu pot vorbi direct între ele; coordonarea trece prin GitHub (issue-uri, branch-uri, PR-uri).

## 1. Ce e deja instalat (`.claude/skills/`)

Sursele, versiunile și ce am exclus: `.claude/skills/README.md`. Regulile de precedență: `CLAUDE.md`. Fluxul de lucru e construit pe skill-urile mattpocock, care se apelează între ele:

```
grill-with-docs  →  to-spec  →  to-tickets  →  implement / implement-spec  →  /code-review  →  pr
(plan + glosar      (spec pe    (tichete cu     (tdd pe fiecare tichet,        (Claude Code)    (descriere PR)
 + ADR-uri)          GitHub)     blocaje)        în worktree propriu)
```

| Skill | Cine | La ce folosește la noi |
|---|---|---|
| `setup-matt-pocock-skills` | Max 1, o singură dată | Configurează GitHub Issues ca tracker, etichetele de triaj și glosarul. Fără el, `to-spec`, `to-tickets` și `triage` nu știu unde să scrie |
| `grill-with-docs` (`grilling` + `domain-modeling`) | Max 1, cu un om | Stres-test pe plan; scrie `GLOSSARY.md` (act, etichetă, impact, termen, stare) și ADR-urile în `docs/adr/`. Glosarul comun e ce ține 6 agenți pe aceleași cuvinte |
| `grill-me` | Oricine | Ca mai sus, fără documente |
| `to-spec`, `to-tickets` | Max 1 | Spec ca issue, apoi tichete „tracer bullet” (felii verticale, fiecare cu „blocat de”). Tichetele fără blocaje sunt „frontiera”: ce poate fi luat acum |
| `triage` | Max 1 | Transformă un issue vag într-un brief bun pentru agent (`ready-for-agent`) |
| `implement` | Fiecare cont, pe tichetul lui | Implementează un tichet cu `tdd`, apoi `/code-review`, apoi commit |
| `implement-spec` | Doar Max | Un singur Max implementează o spec întreagă cu subagenți în paralel, fiecare în worktree, pe un branch de integrare |
| `tdd`, `codebase-design` | Toți codorii | Test roșu, apoi verde, la seam-uri convenite; vocabular comun pentru interfețe |
| `diagnosing-bugs` | Toți codorii | Bucla: feedback loop, reproduce, ipoteze, instrumentare, fix, test de regresie |
| `prototype` | Pro 1-4 | Prototip de aruncat: logică (un HTML cu stările) sau variante de UI |
| `research` | Max 2 | Investigare pe surse primare, rezultat ca fișier Markdown în repo (convenția noastră: `docs/research-*.md`) |
| `to-questionnaire` | Max 1, Max 2 | Decizie pe care doar un om o poate lua (de ex. Andrei: Claude API da/nu) ca chestionar de completat |
| `pr` | Toți | Descrierea PR-ului: rezumat, dovadă înainte/după, risc la merge |
| `handoff` | Conturile Pro, când se apropie de limită | Document pentru următoarea ta sesiune. Pentru alt coleg: comentariu pe issue |
| `writing-for-agents` | Max 1 | Când scrii `CLAUDE.md`, briefuri, skill-uri noi |
| `improve-codebase-architecture` | Max 1, după scheletul cap-coadă | Caută module superficiale și propune refactorizări, cu raport HTML |
| `ui-ux-pro-max` | Pro 2, Pro 4 | Ghiduri UX, contrast, tipografie, review de ecran. Designul de referință rămâne `mockup/index.html` |

Incluse în Claude Code (nu se instalează): `/code-review` (folosit de `implement`), `/security-review`, `/simplify`, `anthropic-skills:deep-research` (Max 2, verificarea actelor), `claude-api` (dacă se decide folosirea Claude API pentru etichete), `dataviz` (bara „Planul meu”), `update-config` (hook-uri), Artifacts (pagini pentru juriu; pentru pitch, tipul Slides).

Nu folosim acum: plugin-ul Stripe (decizia v2: fără Stripe). Dacă decizia se schimbă: `stripe:stripe-best-practices`, `stripe:stripe-docs`, `stripe:test-cards`.

## 2. Ce am luat din adhdcheck și ce nu

Sursa: hackathonul anterior al lui Matei, https://github.com/mateidragomir74/adhdcheck (public).

| Din adhdcheck | Ce am făcut |
|---|---|
| Regulile de bază din `adhdcheck-dev` (nimic inventat, fără secrete, fără date personale, fără formulări interzise) | Adaptate în `CLAUDE.md`, secțiunea „Reguli” |
| Workflow-ul din `adhdcheck-dev` (test întâi, verificare pe ținta reală, screenshot pe 375px, PR cu dovadă) | Acoperit de `tdd`, `implement`, `pr`. Regulile de UI (contrast, „evită look-ul generic AI”) se pot adăuga mai târziu ca skill `ceinseamna-dev`, dacă `CLAUDE.md` devine prea lung |
| Tabelul de decizii D-xx | Înlocuit de ADR-urile din `docs/adr/` (`domain-modeling`); deciziile deja luate sunt în `CLAUDE.md` |
| Briefuri pe persoană, tracker în Markdown | Înlocuite de tichetele GitHub din `to-tickets` (fiecare are „ce construiești”, criterii de acceptare, „blocat de”) |
| Review de integrare cu ledger | Acoperit de `implement-spec` (branch de integrare + `/code-review` + o singură rundă de fix-uri) |
| `scripts/check-secrets.mjs` | De copiat când apare `package.json` (pasul 5.6) |
| Skill-urile de design claudekit (`design-system`, `slides`, `ui-styling`, `brand`, `design`, `banner-design`) | **Neluate.** Se suprapun cu `ui-ux-pro-max` și cu mockup-ul; `design-system` și `slides` depind de fișiere care nu există la noi (`docs/brand-guidelines.md`, `assets/design-tokens.css`); `design` și `banner-design` cer cheie Gemini. Dacă prototipul adoptă Tailwind + shadcn, `ui-styling` se poate copia din `adhdcheck/.claude/skills/` (local la Matei) |
| `AGENTS.md` | Neluat: e generat de Next.js pentru acel proiect |

## 3. Roluri propuse

Propunere; Max 1 o confirmă cu echipa în `grill-with-docs`. Max-urile fac munca lungă și cu context mare; Pro-urile iau câte un tichet mic, într-o sesiune nouă pentru fiecare.

| Cont | Rol | Ce deține |
|---|---|---|
| Max 1 | Orchestrator și integrator | Spec, tichete, glosar, ADR-uri, review de integrare, merge în `main`, `.claude/session-state.md` |
| Max 2 | Research legal și texte | Datele actelor (act, MO, articol, link, „verificat la”), toate textele vizibile, pitch |
| Pro 1 | Motor de reguli | Profil + act → lei/lună, determinist, cu teste |
| Pro 2 | Flux și notificare | Ecranele Noutăți, cardul de act, simularea |
| Pro 3 | Profil și onboarding | Etichetele, formularul, conversația cu asistentul |
| Pro 4 | „Planul meu” și QA | Bara de impact, verificare pe 375px, capturi pentru juriu |

Hand-off-urile devin blocaje între tichete: contractele de date (tipurile pentru profil, etichetă, act, impact) blochează tot; datele actelor (Max 2) blochează motorul (Pro 1); motorul blochează afișarea (Pro 2, Pro 4); textele (Max 2) blochează ecranele.

## 4. Protocolul pentru fiecare instanță

1. Pornești o sesiune nouă în repo. `CLAUDE.md` se încarcă singur.
2. Alegi un tichet de pe frontieră (`ready-for-agent`, fără blocaje deschise, neasignat) din rolul tău și ți-l asignezi: `gh issue edit <n> --add-assignee @me`. Nu lucrezi nimic neasignat.
3. Branch: `feat/<n>-nume-scurt` din `main`. Dacă rulezi două sesiuni pe același calculator, fiecare în worktree-ul ei.
4. `/implement #<n>`. Asta înseamnă `tdd`, apoi `/code-review`, apoi commit.
5. PR cu `pr`, `Closes #<n>`, un reviewer (om sau Max 1).
6. Dacă rămâi fără limită la jumătate: comentariu pe issue (ce e făcut, ce urmează, ce a picat), push pe branch. Următorul care preia citește issue-ul.
7. Nu modifici fișierele altui rol; deschizi un issue pentru el.

## 5. Ce ai de făcut (Max 1)

- [ ] 1. `/setup-matt-pocock-skills`: tracker GitHub, etichetele implicite, glosar single-context. Adaugă blocul `## Agent skills` în `CLAUDE.md`, fără să schimbe restul.
- [ ] 2. `/grill-with-docs` cu cel puțin un om, pe planul de prototip din `.claude/session-state.md` (Vite + React + TS, motor de reguli cu teste) și pe rolurile din secțiunea 3. Închide decizia deschisă: Claude API pentru etichete, da sau nu. Rezultă `GLOSSARY.md` și primele ADR-uri.
- [ ] 3. `/to-spec`, apoi `/to-tickets`. Primele tichete fără blocaje sunt contractele de date și scheletul proiectului.
- [ ] 4. Trimite fiecărui om promptul de start: „Citește `docs/echipa/README.md`, secțiunile 3 și 4. Rolul tău e <rol>. Ia un tichet de pe frontieră.”
- [ ] 5. La fiecare milestone (contracte înghețate, schelet cap-coadă, complet, repetiție demo): review de integrare cu `/code-review` pe tot diff-ul și o singură rundă de fix-uri.
- [ ] 6. Când apare `package.json`: copiază `scripts/check-secrets.mjs` din adhdcheck, adaugă forma cheilor Anthropic (`sk-ant-`) și pune-l ca hook înainte de `git commit` (`update-config`).
- [ ] 7. Opțional: subagent `.claude/agents/inspector.md` pe Haiku, care verifică capturile de ecran contra regulilor de UI. E ieftin, deci se poate rula des.
