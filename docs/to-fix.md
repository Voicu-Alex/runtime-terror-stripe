# To fix / to verify

Open issues found while writing the voice guide and `mockup/voce.html`, 28 October 2026. Each item says where it is and what closes it. Tick an item off and add the source or the commit when it's done.

## 1. Facts to verify (needed before the pitch)

The project rule: nothing invented. Until each of these is verified, the app shows "de verificat" or doesn't show the figure.

- [ ] **Restaurant VAT before 1 Aug 2025.** The 11% rate is confirmed (Law 141/2025, Tax Code art. 291 para. 2 let. n). The old rate isn't: the sources say only that 11% "replaces the old 5% and 9% rates", not which one applied to restaurants (infotva, capital.ro).
  - Where: TVA card "Înainte: de verificat" (`mockup/voce.html`, act `tva`, `chg.old:null`); TODO in `docs/research-v2.md`.
  - Closes it: the Tax Code art. 291 version in force before 1 Aug 2025 on legislatie.just.ro, or ANAF guidance.
- [ ] **CASS on pensions, read in the act text.** "10% on the part above 3,000 lei a month, until 1 Jan 2028" comes from a secondary source (alba24). Law 141/2025 art. II pt. 7, 17/18, 25 wasn't read in the official text.
  - Where: CASS card (`mockup/voce.html`, act `cass`); example in `docs/voce.md` and `docs/voice.md` section 3.
- [ ] **"Before: no CASS on pensions."** The source calls the obligation "newly introduced" but doesn't explicitly say pensions paid no CASS before.
  - Where: CASS card, row "Înainte".
- [ ] **Pilon III deduction of 400 EUR/year.** Tax Code art. 78 is "de confirmat"; the research rates it medium confidence.
  - Where: the "Unde să pun banii?" example in all six voices (`mockup/voce.html` lines ~315–390); `docs/voce.md` line ~123 and the matching example in `docs/voice.md`.
- [ ] **"Pilon III contributions paid by 31 Dec count for that year."** The deadline notification relies on this and it has no source.
  - Where: the "Termen în 2 săptămâni" notification for every voice (`mockup/voce.html` lines ~450–474), including B, which is chosen.
- [ ] **Pilon II payout before Law 2/2026.** Not researched, so the Pilon II card has no "Înainte" row. Decide whether to research it or leave the row out.
- [ ] **IT card amount: −650 vs ≈520 lei/month.** `mockup/index.html` line 430 says −650. `mockup/descriere.html` says ≈520 (tax only, gross 8,000). Pick one number and one method before the pitch.

Already listed as open in `docs/research-v2.md` and `.claude/session-state.md` (not repeated here): building tax (Law 239/2025), the construction figures, the micro 100,000 EUR threshold, and the press-only Pilon II figures (8 years, 1,251 lei minimum).

## 2. Guide inconsistencies (`docs/voce.md`, `docs/voice.md`)

- [x] **Consistent "tu" throughout the app.** Andrei chose informal address everywhere on 29 October 2026. Both voice guides, card copy and catalogue use "tu".
- [ ] **Examples in sections 3, 7 and 8 are still in the calm accountant's voice (A).** The chat is now B. Rewrite the examples, and the before/after table, in B's voice.
- [x] **The card's fixed labels use "tu".** "Pentru tine:" and "Te privește ca:" now match the explanations and actions, following Andrei's choice on 29 October 2026.
- [ ] **The "rare" profile check is my reading of "rar".** At most once a year per tag, only tags that change (renter, mortgage, car), never in the same week as another notification. Andrei needs to confirm the numbers.
- [ ] **No guide section for card or notification copy.** Section 9 (prompt) covers only the chat. Add short rules and examples for E (summary card) and for B notifications (title ≤ ~35 characters, one sentence of body).

## 3. Mockups

- [ ] **`mockup/index.html` doesn't use the chosen voices yet.** Card titles and explanations aren't in E's voice, the opening notification isn't in B's, and the cards have no "Înainte / Acum" row. Apply the voices there; it's the team's reference design.
- [ ] **The Summary and Notifications views in `mockup/voce.html` are Romanian only.** On EN the page says so but still shows Romanian text. Either add EN, or note that they're RO only.
- [ ] **Not visually checked on the published artifact.** All captures (`captures/10`–`19`) are from the local file. Open https://claude.ai/artifact/TRuZz54Gj4QT9PaVKFH4uu on a phone once.
- [ ] **The "Înainte / Acum" row wasn't checked at 375px.** Only at 1280px (`captures/17`).
- [ ] **Of the 10 chat situations, 4 acts and 5 notification types, only a few were checked closely.** Those were: "Veste proastă", scutirea IT, CASS, TVA, "Lună fără noutăți", "Verificare profil". The rest were only checked to load.

## 4. Product rules not implemented yet

These exist only as text in the guide and the mockup; the prototype has to implement them:
- [ ] when a notification is sent (new act, 14 days before a deadline, the day before entry into force);
- [ ] no notification when there are no new laws;
- [ ] the yearly profile check per tag, never in the same week as another notification;
- [ ] the "Înainte / Acum" row needs an old-value field in the acts data, with `null` meaning "de verificat".

## 5. Tooling

- [ ] **The `mockup-v2` config hardcodes port 8767.** `.claude/launch.json` has 8767 in `runtimeArgs`, so when 8767 is busy the server can't start on the port preview assigns. Use a different port or stop the old server.

## 6. Not committed

Nothing from the voice work is committed: `docs/voce.md`, `docs/voice.md`, `docs/to-fix.md`, `mockup/voce.html`, `captures/10`–`19`, the note in `docs/research-v2.md` and `.claude/session-state.md`.

## 7. Actual app integration — 29 October 2026

- [x] B in document onboarding, tag confirmation and extraction prompt; alternative form remains visible.
- [x] E in actual Next.js cards, catalogue explanations and actions; all labels and copy use "tu", including the voice mockup (29 October 2026).
- [x] Sourced before/now metadata; unknown old value and absent comparison handled separately.
- [x] B notification event selection and in-app simulation at `/notificare`; publication, 14-day deadline, entry into force and quiet-day tests pass.
- [ ] Real push delivery, deduplication/history and annual profile checks remain future work.
