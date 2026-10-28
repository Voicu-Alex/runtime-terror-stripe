# Video script: 3 minutes, English

The judges score the video on four questions from the brief (`docs/rethinking_financial_futures_hackathon_stripe.pdf`, p. 4): **who it serves and which problem it solves, how it works end to end, why Romania, and which assumptions, sources and limitations apply.** Every scene below answers one of them. Every figure in the voiceover is in the app with its act and article; do not add new ones.

Pace: about 140 words per minute, so roughly 400 words of voiceover in total. The script below is ~390. Read it aloud once with a timer before recording.

Clips: `node scripts/inregistreaza-demo.mjs` records each scene into `captures/video/` (phone 430×932 and desktop 1440×900). Suggested layout: phone clip on the left third, a short caption on the right, on a light grey background (the app's v3 "Revistă" palette).

| Time | Screen | Voiceover | Caption (on screen) |
|---|---|---|---|
| 0:00–0:15 | `01-carlig` (phone): the hook headline, then case 1 with the notification | On 25 July 2025, a Romanian law gave home buyers six days to keep 48,000 lei. Pay a 20% down payment by 31 July, and your new flat stays at 9% VAT instead of 21%. Most people found out after the deadline. | **6 days · 48,000 lei** · Law 141/2025 |
| 0:15–0:35 | Slide: the ten changes in two years (list from `docs/product.md` 4.3), each with its group of people | This is Romania's real financial problem. Not budgeting: rules that keep changing. In two years: VAT, dividend tax, health contributions on pensions, the IT tax exemption, the energy cap, the building tax. Each change hits a different group of people, and nobody tells you: this one is about you. | **10 rule changes in 2 years. Each hits a different niche.** |
| 0:35–1:00 | `02-profil` (phone): upload the payslip, tags appear, "See your feed" | Meet Ce înseamnă pentru mine, "what it means for me". You upload a payslip or a contract. Claude reads it once, proposes your tags, and you keep or remove them. No bank login, no account. Your profile stays on your phone. | **Your profile in 20 seconds. It never leaves your phone.** |
| 1:00–1:45 | `03-flux` (phone): main article, the numbers, open a card | Then you get your feed: only the laws that touch your money, each one in lei per month. Andrei, an IT employee, loses 520 lei a month since his exemption ended. Open any card: what changed, what you can do, by when, and the exact article in the law, one tap away. Tick what you will do, and My plan shows how much you keep this year. | **Every law, in lei per month. With the deadline and the article.** |
| 1:45–2:15 | `04-admin` then `05-flux-dupa-aprobare` (desktop) | How does it scale? Every day, a model reads the new acts in the Official Gazette. It filters out what does not touch money, and for what does, it proposes the card: who it affects, the date, the action, and the sentence in the law it relies on, word for word. A person reviews and approves, and the card appears in the matching feeds instantly. It costs about nine cents per act. | **Claude reads the Official Gazette. A person approves. ~$0.09 per act.** |
| 2:15–2:35 | `06-surse` (desktop) | We built for trust. Every amount says whether it is our estimate. Anything we could not verify in the official text says so. It is information, not financial advice: we show what the law allows, never which product to buy. | **Sources, assumptions and limitations, in the app.** |
| 2:35–2:50 | `07-pro` (phone) | Pro is a monthly subscription through Stripe, so the people we save money for are the ones who pay, and we stay neutral: no ads, no commissions on products. | **Pro: 15 lei/month, through Stripe** *(confirm the price, see README)* |
| 2:50–3:00 | End card: logo, link, QR | The next law with a deadline will not announce itself. We will. Try it now with your own payslip. | **runtime-terror-stripe.vercel.app** + QR |

## What to check before recording

- **The price.** The app and ADR 0002 say 15 lei/month; `business/slide-cum-facem-bani.md` says 299 lei/year or 49.99 lei/month with a free first month. Pick one; the voiceover and the end card must match the app.
- **The 520 lei.** It is the app's calculation for Andrei (gross 8,000 lei, tax only, OUG 156/2024). Older team material says 650; the app and this script use 520.
- **"Nine cents per act"** comes from `eval/rezultate/sonnet-api/cost.json` (0.8458 USD for 9 acts with Sonnet 5.5). If the team switches models, update it.
- **The live link.** Vercel deploys only Voicu's commits (`README.md` in this folder). Check the link and `PRO_DESCHIS_DEMO=1` before the video goes out, because judges may open it while watching.

## If you need to cut to 2:30

Drop the 2:15–2:35 trust scene and fold one sentence into the end: "Every amount links to the article in the law." Keep the `/admin` scene: it is what makes the technical score.
