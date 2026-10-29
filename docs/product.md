# What it means for me

*When a law changes and touches your money, you learn: what it costs you per month, what you can do and by when, with a link to the article in the law.*

Version 2, 28 October 2026. Decisions taken with Andrei: standalone app, no bank integrations, no Stripe at this stage; strictly financial impact, but across niches; the profile includes the domain you work in; onboarding through a conversation with an assistant, with a form as the fallback.

## What it is

"What it means for me" (Romanian: "Ce înseamnă pentru mine") is an app that tells you which new laws change your money, and by how much.

You have a profile made of tags: how you earn (employee, PFA sole trader, SRL with dividends, pensioner), the domain you work in (IT, construction, hospitality, transport, agriculture, health, education), what you own (home, car, Pilon II, Pilon III private pensions), who depends on you (children), where you live (rent, owned, mortgage) and what you consume (gas, electricity). The profile is built by talking to an assistant, which extracts the tags from what you say, or through a form.

When a new act touches one of your tags, you get a notification. You open it and see: what changed, what it costs or brings you in lei per month, what you can do and by when, why it concerns you (the tags that matched) and the link to the article in the law on the Legislative Portal. You can switch the action on as a simulation and see the total change at once.

Your feed is chronological. Each item has a status: draft (in consultation, may change), adopted (published, not yet in force), in force, deadline passed. The "Planul meu" (My plan) bar shows the 12-month impact without actions and with the chosen actions, plus the next deadline.

You do not connect bank accounts. The manual profile is saved in the browser, but uploaded documents go to the app server and, for AI analysis, to Anthropic. See the [verified data flows](date-personale.md).

## Audience, financial need, product experience

**Audience.** Working Romanians, 25 to 55, whom rule changes hit differently by niche: the IT employee whose tax exemption was removed, the hospitality PFA caught by 11% VAT, the homeowner with a higher building tax from 2026, the pensioner with CASS above 3,000 lei. The primary persona is the employee with a side income and a clear work domain.

**Financial need.** To learn in time which change touches their money, by how much, and what they can do by a date. Not budgeting, not investment advice, not general news.

**Product experience.** Notification, personalised feed, simulation, "My plan". A tag profile, built through conversation.

## What we demonstrate

### 4.1 Who it serves and which problem it solves

It serves people who learn about changes from headlines written for everyone and no one. Romania's financial pain in 2025–2026 is not budgeting, it is rule volatility: in under two years VAT, dividend tax, CASS on pensions, the IT and construction exemptions, the energy cap, the building tax, the micro-enterprise regime and the Pilon II payout all changed. Each change hits a niche. Nobody tells each person: this concerns you, it costs you this much, do this before date X.

### 4.2 How the experience works end to end

1. **The notification.** The phone says: "New in Monitorul Oficial: … For you: −X lei/month · concerns you as: IT employee, tenant."
2. **The feed (Noutăți).** Only acts that intersect your tags appear, newest first, each with status, date, impact in lei and "concerns you as: …". Open an item and you see the explanation, the action with its deadline, the act, the Monitorul Oficial reference, the link to the article in the law and one plain-language source, with "verified on <date>".
3. **Simulation.** Each action has a toggle. Switching it on recalculates the item, the headline and the bar on the spot. A deadline that has already passed stays visible, muted, with what it would have saved.
4. **My plan.** The timeline by effective date, the "Total impact over 12 months" headline and the sticky bar: without actions, with actions, next deadline. The 12-month window counts only the months after each rule's effective date.
5. **Profile.** Your tags, grouped; remove one and the feed changes. Below it, the conversation with the assistant (appearance only in the mockup) and "Prefer a form?".

The demo has four profiles: Andrei, 32, IT employee with dividends from an SRL, tenant; Maria, 45, hospitality PFA with an IRCC-linked mortgage, parent; Ion, 67, pensioner, homeowner; Ioana, 23, recent graduate looking for a first job, tenant (the stability bonus, OUG 11/2026: 27,000 lei over 2 years, with registration at the employment agency before hiring). Each sees a different feed because the tags differ.

### 4.3 Why it is relevant in Romania

The fiscal volatility is concrete and hits by niche:

- IT income-tax exemption removed (January 2025)
- construction and agriculture facilities removed (January 2025)
- VAT from 19% to 21%, reduced rates unified at 11%, hospitality included (August 2025)
- CASS of 10% on pensions above 3,000 lei (August 2025)
- electricity price cap removed (July 2025)
- dividend tax from 10% to 16% (January 2026)
- micro-enterprises: single 1% rate, 100,000 EUR ceiling (January 2026)
- building tax recalculated (January 2026)
- household gas price cap extended to 31 March 2027
- Pilon II payout rewritten by Law 2/2026, applicable from 5 January 2027

Romania reportedly ranks 35th of 39 in the OECD/INFE 2023 adult financial literacy survey (secondary source). At the same time, Revolut announced over 5 million retail customers in Romania (September 2026; company-reported). People have the phone and the digital money, but learn about changes from headlines, not from a tool that filters them by their own life.

### 4.4 Assumptions, data sources, regulatory considerations, limitations

**Assumptions**
- Spending is based on averages; figures marked "estimare" are illustrative.
- Rules are encoded as of 28 October 2026.
- Act-to-person matching is a tag intersection. In the demo the acts are tagged by hand; in the product a language model reads Monitorul Oficial daily and proposes the tags, effective date, action and article, with human review before publishing.

**Sources**
- The Legislative Portal (legislatie.just.ro) for the text of acts, Monitorul Oficial, ANAF, ASF, ANRE, BNR, INS.
- Each item shows the act, the Monitorul Oficial reference, the link to the article, one explanatory source and "verified on <date>".

**Regulation**
- Educational scenarios, not financial or legal advice. Information alone should need no ASF or BNR licence (to be confirmed by a lawyer).
- No account data, no PSD2.
- Personal data: local profile storage does not mean all processing is local. Documents, authentication and payments have external data flows; voice and email remain proposed features. See [Personal data](date-personale.md). Notification previews are computed locally; background delivery is not implemented.

**Limitations**
- Curated rule set in the demo.
- A wrong notification costs trust; that is why each notification shows the tags that triggered it and the person can correct the profile on the spot.
- No tax filing, no legal interpretation.
- Numbers need periodic re-verification.

## Standalone

A standalone app, decided on 28 October 2026. We are not building integrations with banks or payroll apps at this stage. The engine stays a separate module (profile in, impacts out) because that makes it testable, not because we are preparing a widget. Stripe is not part of this version.

## Later

The same tags can cover non-financial effects of laws (obligations, administrative deadlines, new rights). That is a next step, after the financial part works.

## Pitch skeleton

| Criterion (weight) | Pitch or demo moment |
|---|---|
| Challenge fit and differentiation (20%) | Slide 2: not budgeting, rule volatility that hits by niche; ten changes in two years |
| User experience (25%) | Live demo: the notification, the feed, one item opened with the law link, the simulate toggle, "My plan"; change the profile and the feed changes |
| Technical implementation (25%) | Tag matching; a testable rule engine; the pipeline that reads Monitorul Oficial, explained on one slide with a tagged example |
| Delivery and pitch (20%) | One story: one notification, one person, one amount, one deadline; every figure has an act and an article |
| Business mentoring (10%) | Problem and user, value in lei, niches as markets (IT, hospitality, construction, pensioners, homeowners) |

## Sources

Rules in demo v2, verified on 28 October 2026 (Legislative Portal pages were opened and their titles confirmed; articles marked "to confirm" were not read in the text). Details and notes in `docs/research-v2.md`.

| Rule | Act, MO | Legal text | Article | Explanatory source | Confidence |
|---|---|---|---|---|---|
| VAT 21% / 11%, from 1 Aug 2025 | Law 141/2025, MO 699/25 Jul 2025 | https://legislatie.just.ro/Public/DetaliiDocument/300022 | art. II pt. 42 (Fiscal Code art. 291) | https://www.crowe.com/ro/news/alerta-fiscala-modificari-fiscale-din-noul-pachet-fiscal-bugetar | high |
| Dividends 16%, distributed from 1 Jan 2026 | Law 141/2025 | same | art. II pt. 1 (art. 43 para. 2), pt. 5 (art. 97 para. 7) | same | high |
| CASS 10% on pensions above 3,000 lei, 1 Aug 2025 | Law 141/2025 | same | art. II pt. 7, 17/18, 25 | https://alba24.ro/document-masurile-fiscale-care-intra-in-vigoare-din-1-august-2025-doua-cote-tva-cass-pentru-pensii-mari-si-alte-prevederi-1092463.html | high |
| HoReCa VAT 11%, 1 Aug 2025 | Law 141/2025 | same | art. II pt. 42 (art. 291 para. 2) | https://www.capital.ro/schimbari-la-tva-accize-concedii-medicale-si-cass-intra-in-vigoare-de-astazi-1-august.html | medium |
| Electricity cap, ended 1 Jul 2025 | GEO 6/2025, MO 182/28 Feb 2025 | https://legislatie.just.ro/public/DetaliiDocument/295106 | art. 1 para. (1) (a) | https://economedia.ro/plafonarea-preturilor-la-energiei-electrica-inceteaza-de-la-1-iulie-recomandarile-anre.html | high |
| Household gas 1 Apr 2026 – 31 Mar 2027 (adopted) | GEO 12/2026, MO 178/9 Mar 2026; amended by GEO 19/2026 | https://legislatie.just.ro/public/DetaliiDocument/308129 | art. 1, 3, 6 | https://infocons.ro/pretul-gazelor-naturale-pentru-consumatorii-casnici-ce-se-schimba-de-la-1-aprilie-2026-si-ce-trebuie-sa-stii-infocons-te-informeaza/ | high; 0.31 lei/kWh is a press figure, the act uses a formula |
| Pilon II: 30% lump sum, rest staggered, from 5 Jan 2027 | Law 2/2026, MO 2/5 Jan 2026 | https://legislatie.just.ro/Public/DetaliiDocument/306255 | art. 55 para. (1); art. 113 | https://romania.europalibera.org/a/guvernul-a-modificat-legea-pensiilor-private-se-pot-lua-30-din-suma-acumulata-intr-o-singura-transa-esalonare-apoi-pe-opt-ani/33509248.html | high; 8 years and 1,251 lei minimum are press-only |
| Micro 1% from 1 Jan 2026 | GEO 89/2025, MO 1203/24 Dec 2025 | https://legislatie.just.ro/Public/DetaliiDocument/305817 | art. I pt. 4 (art. 51 para. 1) | https://static.anaf.ro/static/10/Anaf/legislatie/OUG_89_2025.pdf | medium; 100,000 EUR ceiling and employee condition to confirm |
| IT exemption removed, 1 Jan 2025 | GEO 156/2024, MO 1334/31 Dec 2024 | https://legislatie.just.ro/Public/DetaliiDocument/293109 | to confirm | https://assets.kpmg.com/content/dam/kpmg/ro/pdf/2025/TNF_OUG_156_2024_Ordonanta_trenulet_dec_2024.pdf | medium; −650 lei/month is our arithmetic for 12,000 gross |
| Construction/agriculture facilities removed, 1 Jan 2025 | GEO 156/2024 | same | to confirm | https://startupcafe.ro/ordonanta-trenulet-1562024-publicat-monitorul-oficial-salariul-minim-net-constructii-scade-30009 | low |
| Building tax, 2026 taxable value | Law 239/2025, MO 1160/15 Dec 2025; GEO 78/2025 | https://legislatie.just.ro/Public/DetaliiDocument/305208 | to confirm | https://adevarul.ro/economie/statul-face-un-pas-inapoi-impozitul-pe-valoarea-2495086.html | low; the increase is press-only, some points postponed to 2027 |
| Pilon III deduction 400 EUR/year | Fiscal Code, Law 227/2015 | https://legislatie.just.ro/Public/DetaliiDocument/171282 | art. 78 (to confirm) | https://www.fiscalitatea.ro/pilonul-iii-de-pensii-facultative-deductibilitate-fiscala-si-inregistrari-contabile-25028/ | medium; ≈200 lei/year assumes ≈2,000 lei for 400 EUR |

Window 1 Sep – 28 Oct 2026: no published act or draft in consultation that changes money was found (MF, ANAF, MO searched). That is why the demo notification is Law 2/2026, the most recent adopted act with a future effect.

Sources for section 4.3: financial literacy, OECD/INFE 2023 (press: 35th of 39; exact score not found), https://oecd.org/en/publications/oecd-infe-2023-international-survey-of-adult-financial-literacy_56003a32-en.html; digital adoption, Revolut 5 million retail customers in Romania, reported 30 Sep 2026, https://www.romania-insider.com/revolut-reaches-5-mln-retail-customers-romania-plans
