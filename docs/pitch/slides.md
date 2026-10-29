# Slide-uri: recomandări (nu modifică prezentarea în lucru)

Prezentarea în lucru rămâne a voastră. Aici sunt o structură și texte-exemplu în engleză, gândite pentru **3 minute** și pentru cazul în care prezentați live după video. Regula de bază: **un slide = o idee = o cifră**. Tot ce n-apucați să spuneți în 3 minute nu intră.

## Structura propusă (6 slide-uri + demo)

| # | Rol | Titlu (exemplu) | Ce e pe slide | Criteriu |
|---|---|---|---|---|
| 1 | Cârligul | **The law gave you 6 days to keep 48,000 lei. Did you know?** | Doar titlul, mare. Dedesubt, mic: *Law 141/2025, art. III · MO 699 / 25 Jul 2025* | Pitch 20% |
| 2 | Problema | **10 rule changes in 2 years. Each one hits a different niche.** | Lista din `docs/product.md` 4.3, în două coloane, fiecare cu grupul afectat (IT, HoReCa, pensioners…). Fără paragrafe. | Fit 20% |
| 3 | Soluția | **Every new law, in lei per year, for you.** | Captura cardului (`captures/demo-03-card-en-375.png`) într-o ramă de telefon. Trei etichete lângă: *amount · deadline · article* | UX 25% |
| — | **Demo live** sau clipurile 02 → 03 → 04 | | Profil din document → flux → card → /admin „Approve” → cardul apare | UX + Tech 50% |
| 4 | Cum merge | **Claude reads the Official Gazette. A person approves.** | Diagramă cu 4 pași: *new act → money? (filter) → proposed card + quote → human approval → feeds*. Cifra: *~$0.09 per act*. | Tech 25% |
| 5 | Încredere și business | **Neutral by design.** | Stânga: *profile on your phone · documents never stored · every amount with its article*. Dreapta: *Pro, X lei/month via Stripe · no ads · no product commissions*. | Business 10% |
| 6 | Final | **The next law with a deadline will not announce itself.** | Linkul + QR mare (spre `/?lang=en`), numele echipei. | Pitch 20% |

## Direcția vizuală

Folosiți designul aplicației (ADR 0001, „Revistă” pe gri), ca slide-urile și demo-ul să pară același produs:

- fundal alb sau gri cald foarte deschis (`#F1F0EE`), text aproape negru (`#111827`);
- titluri în **Raleway ExtraBold**, text în **Inter**, ambele gratuite pe Google Fonts;
- **verde (`#15803D`) doar pentru bani în plus, roșu doar pentru bani în minus**, ca în aplicație;
- cifra cea mai importantă de pe slide e cel mai mare element de pe slide;
- capturi reale din aplicație (`captures/demo-*.png`), nu iconițe generice sau poze de stoc.

## Ce să evitați

- slide-uri cu paragrafe: dacă trebuie citit, juriul nu vă mai ascultă;
- cifre fără sursă: sub fiecare cifră, mic, actul și articolul (regula „nimic inventat” din `CLAUDE.md`);
- „AI-powered” ca argument: arătați ce face (citește Monitorul Oficial, citează fraza din lege), nu eticheta;
- trei prețuri diferite în materiale diferite (vezi README, „De decis înainte”).

## QR-ul

Puneți QR-ul spre `https://descriere.andreidobrin.com/?lang=en`: parametrul pornește aplicația direct în engleză. Generați-l cu orice generator offline sau cu `npx qrcode -o qr.png "https://descriere.andreidobrin.com/?lang=en"`. Testați-l de pe două telefoane înainte.
