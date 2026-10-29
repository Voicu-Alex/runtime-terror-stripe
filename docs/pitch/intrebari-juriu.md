# Jury questions: short answers (English)

One or two sentences each, then stop. Every answer is backed by the app or a file in the repo; the file is in brackets for whoever prepares the answer, not to be read out.

**Why not just ask ChatGPT?**
ChatGPT answers when you know what to ask. We come to you on the day the law appears, already filtered to your situation, with the amount, the deadline and the article, checked by a person. *(business/README-chris.md, decision 4)*

**Isn't this financial or tax advice? Is it regulated?**
It is information: we show what the law changes and the actions the law itself allows, with the article next to them, and we never recommend a financial product. Tax consulting is regulated in Romania (GO 71/2001) and investment advice falls under the ASF, so complex cases go to a specialist from the official CECCAR or CCF registers. We still need a lawyer to confirm the classification. *(/surse, business/profesionisti.md)*

**How do you cover every new law, not 42 hand-picked ones?**
A model reads every act in the Official Gazette, filters out what does not touch money and proposes the card. In our test it read 9 acts with every automatic check passing, at about 9 cents per act; a person approves before anything is published. *(/admin, docs/eval-modele.md, eval/rezultate/sonnet-api/cost.json)*

**What if the model is wrong?**
Three guards: the model must quote the sentence from the act word for word, it states its confidence and what a person must check, and nothing reaches a feed without approval. On the user side, every card shows why it matched ("applies to you as") and links to the law. *(/admin, lib/inbox.ts)*

**What do you do with my data?**
The profile stays on your phone; there is no account for it. A document is read once and never stored, and personal ID numbers and IBANs are masked. Payment is on Stripe's page; we never see the card. *(/surse, lib/anonimizare.ts, docs/adr/0002-abonament-stripe.md)*

**Why would anyone pay?**
Because the value is in lei: one missed deadline in our cases cost 6,000 to 48,000 lei. Pro gives the amount for your profile, the deadlines, the actions and My plan, for 15 lei a month. *(landing page cases; price: ADR 0002, the same in the app and the business material)*

**How do you reach users?**
A free public calculator for each big law, the press when a law lands, and employers offering it as a benefit. *(business/slide-cum-facem-bani.md)*

**How accurate are the amounts?**
The amount is our calculation on your profile, and the card says so. Amounts based on averages are marked as estimates, and each act carries a confidence level. *(/surse, data/catalog.json: estimare, incredere)*

**Why only Romania?**
Romania changed VAT, dividend tax, health contributions, sector tax exemptions, energy caps and local taxes within two years, and each change hit a different group. The engine is country-agnostic; the catalogue and the sources are Romanian. *(docs/product.md 4.3)*

**Where is Stripe in this?**
Pro is a monthly subscription through Stripe Checkout, linked to the Google account email, with the customer portal for cancelling. Stripe Managed Payments handles VAT as the merchant of record. *(docs/adr/0002-abonament-stripe.md)*

**The legal texts are in Romanian. Is that a problem?**
The whole app works in English and Romanian, including the legal explanations; the Romanian text is the verified one, and the English is an unofficial translation with the same facts and figures. Quotes from the law stay in Romanian, with the translation underneath. *(data/traduceri-en.json, lib/traduceri.ts)*
