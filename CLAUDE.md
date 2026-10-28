# Ce înseamnă pentru mine

Hackathon Nexxt × Stripe „Rethinking Financial Futures” (România). Aplicație care îi spune utilizatorului ce acte normative noi îi schimbă banii, cu cât (lei/lună), ce poate face și până când, cu link la articolul din lege. Descrierea completă: `docs/produs.md` (RO) și `docs/product.md` (EN). Starea curentă și deciziile deschise: `.claude/session-state.md`.

Echipa: 6 instanțe Claude în paralel (2 Max, 4 Pro). Cum ne împărțim și ce skill-uri folosim: `docs/echipa/README.md`.

## Decizii luate (nu se redeschid fără echipă)

- Aplicație de sine stătătoare: fără integrări bancare. Plata e un abonament lunar de 15 lei prin Stripe Checkout; fără abonament nu se văd sumele și Planul meu (`docs/adr/0002-abonament-stripe.md`).
- Strict impact financiar, pe nișe. Efectele nefinanciare vin mai târziu.
- Profilul e format din etichete, inclusiv domeniul de lucru. Onboarding prin conversație cu un asistent, cu formular ca alternativă.
- Fiecare element din flux are o stare: proiect, adoptat, în vigoare, termen depășit.

## Reguli

- **Nimic inventat.** Orice act, articol, sumă sau termen are sursă verificată (act, Monitorul Oficial, articol, link Portal Legislativ, data verificării) în `docs/research-v2.md` sau în fișierul de date al actelor. Altfel se scrie `TODO`.
- **Nu e sfat financiar.** Fără „garantat”, „vă recomandăm să investiți”, „cel mai bun produs”. Arătăm impactul și acțiunea posibilă din lege, nu recomandăm produse.
- **Fără secrete și fără date personale reale** în repo. Personele din demo (Andrei, Maria, Ion, Ioana) sunt fictive.
- **Designul de referință e `mockup/v3/index.html?v=f`** („Revistă”, pe gri; `docs/adr/0001-design-v3-revista-gri.md`). Verde pentru bani în plus, roșu pentru bani în minus, titluri care spun totul din prima. Un sistem de design nou se adoptă doar prin decizie de echipă.

## Skill-uri: ordinea de precedență

Regulile de mai sus și deciziile din `docs/adr/` au prioritate față de orice skill. Skill-urile din `.claude/skills/` sunt luate din surse externe (vezi `.claude/skills/README.md`). Unde se suprapun:

- `code-review`, invocat de `implement`, `implement-spec` și `tdd`, înseamnă `/code-review` din Claude Code. Nu există altă variantă în repo.
- Glosarul de domeniu este `GLOSSARY.md` (nu `CONTEXT.md`). Îl creează `domain-modeling` când apare primul termen.
- `handoff` scrie în directorul temporar al sistemului, deci e doar pentru următoarea ta sesiune. Ce trebuie să afle alt coleg se scrie ca comentariu pe issue-ul GitHub.
- `ui-ux-pro-max` e pentru ghiduri și review. Scripturile se rulează din rădăcina repo-ului (`python .claude/skills/ui-ux-pro-max/scripts/search.py ...`). Nu folosi `--persist` (ar crea un `MASTER.md` concurent cu designul de referință) fără decizie de echipă.
- `tdd` cere confirmarea seam-urilor. Pentru un agent fără om în buclă, seam-urile convenite sunt cele din spec sau din ticket.
