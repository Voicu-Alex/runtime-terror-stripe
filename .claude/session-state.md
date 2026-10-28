# Session state

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
