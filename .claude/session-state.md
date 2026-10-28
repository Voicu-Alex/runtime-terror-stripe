# Session state

Updated: 2026-10-28 14:10

## Context
Hackathon Nexxt × Stripe "Rethinking Financial Futures" (Romania only). Product: **"Ce înseamnă pentru mine"**, a personal fiscal-impact timeline: 4-question profile → dated rule changes translated to lei/month → simulate toggles per action → sticky "Planul meu" bar (without vs with actions). Standalone web app, integration-ready rule engine. Plan file: `~/.claude/plans/make-a-mockup-based-effervescent-sutherland.md`.

## Done (this session)
- `mockup/index.html`: self-contained bilingual (RO default / EN) mockup, 3 preset profiles (Andrei 32 angajat+SRL, Maria 45 PFA, Ion 67 pensionar), 7 rule cards, date-aware actions (TODAY = 2026-10-28; passed deadlines muted), live 12-month headline and plan bar. Served via `.claude/launch.json` → `python -m http.server 8765 --directory mockup`.
- `docs/produs.md` (RO) + `docs/product.md` (EN): what it is, audience/need/experience answer, the 4 "what to demonstrate" answers, standalone-vs-integrated paragraph, pitch skeleton by jury weight, 7 rules with sources.
- Rule set verified by researcher (secondary sources; Monitorul Oficial texts not opened). Gas cap end (31 Mar 2027) and Pilon II payout (5 Jan 2027) are the genuine "upcoming" items.

## Done (session 2, clone at ~/projects/runtime-terror-stripe-andrei)
- `mockup/descriere.html`: Romanian product description page for the jury, built on the locked "profil din etichete" idea (6 tag families incl. Domeniul meu, asistent/formular, LLM reads Monitorul Oficial, notificare → flux + Planul meu, standalone, no Stripe/bank). Answers the 4 PDF "What the demonstration should make clear" points as numbered sections, plus Ce nu facem, Mai târziu, criteria table, sources. Opening notification = Pilon II / Legea 2/2026 + Pilon III before 31 dec 2026.
- `docs/rethinking_financial_futures_hackathon_stripe.pdf` copied in and linked from the page.
- Served on port 8766 (`descriere` in launch.json); 8765 belongs to the other session.
- Capture: `captures/07-descriere-desktop.png`. Phone width checked live in the browser pane (scrollWidth 375). Headless Edge cannot render below ~500px, so its phone capture was misleading and was deleted.

## Next step
- Andrei reviews the mockup captures; on approval → Slice 3 prototype (Vite + React + TS, rule engine with Vitest tests, fallback explanations, no LLM, no Stripe) per plan file.

## Open in tools
- Browser pane: http://localhost:8765 (preview server "mockup", may need restart).
- Studio / Blender: not used.
- Branch: `andrei` on https://github.com/Voicu-Alex/runtime-terror-stripe (pushed; base `main`).

## Open questions for Andrei
- Approve the mockup as the reference for implementation? Any change to the hero action (Pilon III top-up before 31 Dec 2026)?
- Keep the session in a chosen folder (files are in the app-made session folder).

## Proof so far
- `captures/` holds phone-width screenshots (RO default, Pilon III toggle on, EN, dividend "termen depășit" card) and a desktop capture. Fix round 1 (plan bar height, action row layout) applied and re-captured; all five captures are post-fix.
