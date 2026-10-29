# Buzunar (Pocket)

**Legea, pe banii tăi.** Buzunar îți spune ce legi noi îți schimbă banii, cu cât și până când.

Hackathonul Nexxt × Stripe „Rethinking Financial Futures”, echipa Runtime Terror.

- Aplicația: https://main.d35dxj4gdere6m.amplifyapp.com (și https://descriere.andreidobrin.com)


## Pe scurt

Îți faci un profil răspunzând la 6 întrebări sau încărcând un fluturaș de salariu. Aplicația îți arată apoi doar legile care te privesc:

- cât te costă pe an și cât poți păstra dacă faci ce permite legea;
- termenele, calculate din datele scrise în lege;
- articolul exact și unde mergi ca să acționezi;
- un asistent pe fiecare lege („Întreabă”).

„Toate legile” are tot catalogul, cu căutare. Fiecare sumă are sursa lângă ea: actul, Monitorul Oficial, articolul.

În spate, un pipeline citește actele noi de pe Portalul Legislativ (~31 pe zi). Claude păstrează doar ce atinge banii (~3 pe zi) și propune cardul, citând legea cuvânt cu cuvânt. Un om aprobă înainte de publicare. Sumele le calculează codul, nu AI-ul.

Prima lege e gratuită, plus încă una pentru profilul completat; Pro deschide tot pentru 15 lei pe lună, prin Stripe. În română și engleză, cu mod de noapte, instalabilă pe telefon. Informare, nu sfat financiar.

## In English

Pocket tells you which new Romanian laws change your money, by how much, and by when. Build a profile from six quick questions or a payslip, and see only the laws that apply to you: what they cost you each year, what you can keep if you act, the deadline, and the exact article. A daily pipeline reads the official Legislative Portal, Claude drafts each change and quotes the law word for word, and a person approves it before it goes live. One law is free; Pro unlocks everything for 15 lei a month via Stripe.

## Paginile

| Unde | Ce e |
|---|---|
| `/` | Pagina de prezentare |
| `/aplicatie` | Pentru tine: bilanțul pe an, legile tale, termenele (`?p=andrei` pentru un exemplu) |
| `/legi` | Toate legile: tot catalogul, căutare, cel mai nou primul sau după cât poți salva |
| `/profil` | Asistentul cu 6 întrebări, încărcarea unui document și Planul meu |
| `/abonament` | Pro prin Stripe |
| `/admin`, `/admin/acte` | Aprobarea legilor propuse de model |
| `/surse` | Surse, ipoteze și limitări |

## Cum funcționează

```
Portalul Legislativ (~31 acte/zi)
  → reguli + triaj Claude Haiku (~3/zi ating banii)
  → Claude Sonnet propune cardul și citează legea; codul verifică citatul
  → un om aprobă în /admin/acte
  → catalogul (data/catalog.json, Supabase) → sumele, calculate de cod pe profilul tău
```

Detalii: [docs/ingest.md](docs/ingest.md) (pipeline-ul), [docs/eval-modele.md](docs/eval-modele.md) (modelele), [docs/date-personale.md](docs/date-personale.md) (ce date pleacă unde), [docs/adr/](docs/adr/) (deciziile).

Tehnologii: Next.js, TypeScript, Tailwind, Supabase, Stripe, Auth.js (Google), Claude (Anthropic), Vitest.

## Rulare locală

```bash
npm install
cp .env.example .env.local   # completează cheile; fără ANTHROPIC_API_KEY, analiza și asistentul merg în mod demo
npm run dev                  # http://localhost:3000
npm test                     # testele
npm run build                # build de producție
```

## Reguli

- **Nimic inventat.** Orice act, articol, sumă sau termen are sursă verificată; altfel scrie `TODO`.
- **Nu e sfat financiar.** Arătăm ce schimbă legea și ce acțiuni permite ea, nu recomandăm produse.
- **Fără secrete și fără date personale reale** în repo. Persoanele din demo sunt fictive.

Mai multe: [CLAUDE.md](CLAUDE.md), [docs/produs.md](docs/produs.md) (RO), [docs/product.md](docs/product.md) (EN).
