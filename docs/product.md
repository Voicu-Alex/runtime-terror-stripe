# What it means for me

*Every rule change, translated into lei per month for you, with one action and a deadline.*

## What it is

"What it means for me" (Romanian: "Ce înseamnă pentru mine") is an app that shows you which laws and taxes are changing and what that costs you personally.

You answer four questions: how you earn (employee, PFA (sole trader), SRL (limited company) with dividends, or pensioner), your net income, your housing (rent, owned, or mortgage) and whether you hold Pilon II and Pilon III (the private pension pillars).

You get a timeline of the changes that apply to you, for example VAT at 21%, dividends taxed at 16%, or the micro-enterprise regime with a single 1% rate and a 100,000 EUR ceiling. Each has a date, an impact in lei per month, one sentence on why, and a dated action. You can switch an action on as a simulation and see the impact change at once.

You do not need a bank login and you connect nothing. You fill in your profile by hand in under a minute, and it stays on your phone.

## Audience, financial need, product experience

**Audience.** Working-age Romanians, 25 to 50, who earn and are hit by rule changes: employees, people with side income through a PFA or SRL, Pilon II holders. The primary persona is the employee with a side income.

**Financial need.** Clarity on upcoming changes to their own money, in lei per month, with a dated action. Not budgeting, not investment advice.

**Product experience.** Four questions, a timeline, simulated actions, then "Planul meu" (My plan).

## What we demonstrate

### 4.1 Who it serves and which problem it solves

It serves people who earn and learn about changes from headlines. Romania's financial pain in 2025–2026 is not budgeting, it is rule volatility. In under a year VAT, dividend tax, CASS (the health contribution) on pensions, the energy price cap, the micro-enterprise regime and the Pilon II payout all changed. Nobody tells each person in plain terms: what does this do to my money, and what do I do before date X?

### 4.2 How the experience works end to end

1. **Profile.** Four questions, under a minute, no account, no bank.
2. **Timeline.** Only the rules that apply to you appear, in date order. The timeline mixes "in force" and "upcoming" cards. A deadline that has already passed stays visible, muted, as "deadline passed", with what it would have saved. The product shows what was lost, honestly.
3. **Simulation.** Each action has a toggle. The demo example: "Before 31 Dec 2026: top up Pilon III to the deductible ceiling of 400 EUR/year (about 200 lei tax saving)", tied to the Pilon II payout reform that applies from 5 January 2027. Switching it on recalculates the card, the headline and the bar on the spot.
4. **My plan.** A sticky bar shows impact without actions against impact with the chosen actions, plus the next deadline. The headline and the bar recompute live; no total is hard-coded. The 12-month window counts only the months after each rule's effective date.

The demo has three profiles: Andrei, 32, an employee with dividends from an SRL; Maria, 45, a PFA with an IRCC-linked mortgage; Ion, 67, a pensioner. Each sees a different timeline.

### 4.3 Why it is relevant in Romania

The fiscal volatility is concrete. Changes in the last year and a half:

- VAT from 19% to 21%, reduced rates unified at 11% (August 2025)
- dividend tax from 10% to 16% (January 2026)
- CASS of 10% on pensions above 3,000 lei (August 2025)
- electricity price cap removed (July 2025)
- household gas price cap extended to 31 March 2027
- micro-enterprises: single 1% rate, 100,000 EUR ceiling (January 2026)
- Pilon II payout rewritten by Law 2/2026, applicable from 5 January 2027: up to 30% as a lump sum, the rest paid out over time

Romania reportedly ranks 35th of 39 in the OECD/INFE 2023 adult financial literacy survey (secondary source; exact score not reconfirmed). At the same time, Revolut announced over 5 million retail customers in Romania (September 2026; company-reported figure, registered customers, not active ones). People have the phone and the digital money, but learn about changes from headlines, not from a tool that personalises them.

### 4.4 Assumptions, data sources, regulatory considerations, limitations

**Assumptions**
- Spending is based on averages.
- Numbers in the demo are illustrative.
- Rules are encoded as of 28 October 2026.

**Sources**
- Monitorul Oficial (the Official Gazette), ANAF (tax agency), ASF (financial regulator), ANRE (energy regulator), BNR (central bank), INS (statistics office).
- Each rule cites one source and shows "verified on <date>".

**Regulation**
- Educational scenarios, not financial advice. Information alone should need no ASF or BNR licence (to be confirmed by a lawyer).
- No account data, no PSD2.
- GDPR: the profile stays on the device, nothing is stored server-side.

**Limitations**
- Curated rule set: seven rules in the demo.
- No personal tax filing.
- No legal interpretation.
- Numbers need periodic re-verification.

## Integrated or standalone?

Today it is a standalone web app, because that lets us test it with real people. The rule engine is a pure module: a JSON profile goes in, a list of impacts comes out. It does not depend on the interface. The same logic can run as a widget inside a bank, a neobank, a payroll provider or an accounting app. Standalone today, embeddable tomorrow. Stripe integration is not part of this version.

## Pitch skeleton

| Criterion (weight) | Pitch or demo moment |
|---|---|
| Challenge fit and differentiation (20%) | Slide 2: not budgeting, rule volatility; the seven changes |
| User experience (25%) | Live demo: four questions, timeline, simulate toggle, "Planul meu" bar; three profiles |
| Technical implementation (25%) | Live toggle changes the headline; the rule engine is testable code, not slides |
| Delivery and pitch (20%) | One story: Pilon III before 31 December 2026; every number has a source |
| Business mentoring (10%) | Problem and user, value in lei, adoption through widgets in banks and payroll apps |

## Sources

Seven rules in the demo.

1. VAT 19% to 21% (and reduced rates 5%/9% unified at 11%), from 1 Aug 2025, Law 141/2025 (MO 699/25 Jul 2025). Source: https://www.ey.com/en_gl/technical/tax-alerts/romanian-tax-changes-introduced-by-new-fiscal-and-budgetary-measures
2. Dividend tax 10% to 16%, dividends distributed from 1 Jan 2026, Law 141/2025. Source: https://static.anaf.ro/static/10/Galati/Vrancea/Modif-imp-dividende-Legea-141-25.pdf
3. CASS 10% on pensions above 3,000 lei/month (on the excess), from 1 Aug 2025, Law 141/2025. Source: https://www.contzilla.ro/exemplu-de-calcul-cass-la-pensii-peste-3-000-lei/
4. Electricity price cap removed from 1 Jul 2025. Source: https://www.bursa.ro/plafonarea-preturilor-la-energiei-electrica-inceteaza-de-la-1-iulie-62861658
5. Household gas price cap extended 1 Apr 2026 to 31 Mar 2027 (0.31 lei/kWh), GEO 12/2026; expires 31 Mar 2027. Source: https://www.puterea.ro/?p=557629 (note: one article describes it as a draft, another as adopted; to be reconfirmed)
6. Pilon II: staggered payout, Law 2/2026 (MO 2/5 Jan 2026), applicable from 5 Jan 2027: up to 30% as a lump sum, the rest monthly over at least 8 years or as a lifetime annuity. Source: https://www.asfromania.ro/uploads/articole/attachments/6a5a01012ff41241294550.pdf and https://hotnews.ro/?p=2148208
7. Micro-enterprises 2026: single 1% rate (3% rate eliminated), 100,000 EUR ceiling, at least one employee, GEO 89/2025 + GEO 8/2026, from 1 Jan 2026. Source: https://www.fiscalitatea.ro/microintreprinderi-2026-ultimul-an-in-care-termenul-limita-pentru-plata-impozitului-este-25-iunie-24852/

The Monitorul Oficial texts were not opened directly; the sources are ANAF/ASF/EY/press summaries. To be reconfirmed before the presentation.

Sources for section 4.3: financial literacy, https://oecd.org/en/publications/oecd-infe-2023-international-survey-of-adult-financial-literacy_56003a32-en.html; digital adoption, https://www.romania-insider.com/revolut-reaches-5-mln-retail-customers-romania-plans
