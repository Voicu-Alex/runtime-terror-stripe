# Ce funcționează design-wise în fintech: research și profil

*Research făcut pe 28 octombrie 2026. Sursele sunt în mare parte bloguri de agenții și ghiduri de design, nu studii peer-reviewed. Le tratăm ca un consens al industriei, nu ca date dure. Excepție: cercetarea Stanford despre credibilitate (Fogg) și NN/g.*

## TL;DR: profilul utilizatorului de fintech

Utilizatorul de produse financiare este **prudent înainte de a fi curios**. Decide în câteva secunde dacă un site „pare serios" și abia apoi citește. Îi place:

1. **Calm, nu spectacol.** Mult spațiu alb, o singură idee pe ecran, culori sobre cu un singur accent. Animațiile stridente, culorile prea vii și 3D-ul stângaci scad încrederea.
2. **Cifre concrete, imediat.** Sume reale în hero („economisești 200 lei"), nu promisiuni vagi („optimizează-ți finanțele").
3. **Să încerce singur.** Calculator, simulator sau comparator în care își pune propriile date și vede rezultatul pe loc. Asta convinge mai mult decât orice text.
4. **Să știe cine e în spate și de unde vin cifrele.** Surse, licențe, „verificat la", oameni reali, nu doar logo-uri.
5. **Să simtă că datele lui sunt în siguranță**, spus clar, aproape de buton, nu ascuns în footer.
6. **Limbaj simplu.** Fără jargon; fiecare termen tehnic tradus în consecința lui pentru bani.

## Ce se repetă la aproape toate site-urile bune

Am comparat tiparele de la Stripe, Wise, Revolut, Monzo, N26, Mercury, Ramp, Qonto, Wealthsimple și câteva fintech-uri de investiții europene (Ramify, Yomoni, Goodvest).

### Structura paginii
- **Hero cu o singură promisiune + un singur CTA principal.** N26 și Revolut: un buton evident, nimic care să concureze cu el.
- **Produsul arătat, nu descris.** Revolut și Qonto pun capturi ale aplicației direct în hero. Stripe arată UI-ul real.
- **Cifra-cheie mare, deasupra fold-ului.** Wise arată în hero taxa exactă și cât economisești față de bancă.
- **Widget interactiv sus în pagină.** Convertorul Wise; simulatoarele de pensie Yomoni/Ramify, cu economie de impozit estimată. Exact categoria produsului nostru.
- **Dovezi sociale în fluxul principal**, nu doar jos: testimoniale, număr de utilizatori, premii.
- **Pagina de securitate/transparență ca destinație proprie** (Plaid `/safety`, Mercury Security), legată din mai multe locuri.

### Vizual
- **Tipografie: sans-serif neutru (grotesk).** Stripe: Söhne; Mercury, Ramp, Brex: Inter sau echivalente. Fără fonturi „de afiș" în UI.
- **Paletă mică:** neutre (alb, gri foarte deschis, aproape-negru) plus **un singur accent de brand** (verdele Wise, mov-albastru Stripe). Ghidurile de dashboard recomandă 2–3 culori active, maxim ~5.
- **Culoarea înseamnă stare, nu decor.** Stripe e referința: culoarea apare doar ca să semnaleze ceva (succes, eroare, atenție).
- **Mișcare reținută:** o animație ambientală discretă (gradientul Stripe) + o interacțiune declanșată de utilizator. Cu fallback pentru `prefers-reduced-motion`.
- **Oameni reali în imagini** (Monzo, Chime, Wealthsimple) când vrei căldură; ilustrații abia când tonul e prea rece (Revolut cu ilustrațiile 3D).

### Cifre și date
- **Cifre tabulare** (`font-variant-numeric: tabular-nums`), ca să nu „sară" când se recalculează. Important pentru noi, pentru că bara „Planul meu" se recalculează live.
- **Numerele aliniate la dreapta**, textul la stânga.
- **Formatare locală prin `Intl.NumberFormat('ro-RO')`**: `1.234,56 lei`, nu scrisă de mână.
- **Semnul minus adevărat (−, U+2212)** și `+` explicit la diferențe.
- **Niciodată câștig/pierdere doar prin culoare.** Roșu/verde + semn sau săgeată (▲▼). Aproximativ 1 din 12 bărbați nu distinge roșu de verde.
- **Stări distincte:** ce e simulat nu trebuie să arate ca ce e sigur. Ce e „în vigoare" se deosebește vizual de ce „urmează".

### Încredere și conformitate
- **Disclaimerul stă lângă cifra pe care o califică**, nu în footer, nu gri pe gri, nu minuscul.
- **Proiecțiile sunt etichetate ca proiecții**, cu ipotezele scrise inline.
- **Riscul are cel puțin aceeași vizibilitate ca beneficiul.**
- **Mesaje despre date lângă CTA:** „fără cont", „nu legi banca", „datele rămân pe telefon".
- **Fără stări mute.** O pauză de două secunde fără feedback după un click pe ceva cu bani îl sperie pe utilizator.

## Ce spune cercetarea despre credibilitate

- **Stanford (Fogg, peste 1.400 de participanți, 51 de elemente):** credibilitatea crește cu „real-world feel" (oameni, adresă, contact real), ușurința de folosire, expertiza, încrederea și **personalizarea** („tailoring"). Scade cu aspectul amator și cu intențiile comerciale prea vizibile.
- **Credibilitatea are trei dimensiuni:** expertiză, încredere și **aspect vizual**. Designul nu e cosmetic, e o treime din credibilitate.
- **NN/g, „Pyramid of Trust":** nu ceri angajament (date, cont) până nu ai satisfăcut nevoile de bază de încredere. Ceri pe trepte.
- **Testarea încrederii e separată de testarea uzabilității:** un produs poate fi ușor de folosit și tot să nu inspire încredere. Metoda recomandată e testul de 5 secunde: „ce ai reținut? ți-ai introduce datele aici?"

## Contextul românesc

- **60% dintre români** spun că au încredere că aplicațiile de mobile banking le țin banii în siguranță; Gen Z (65%) și cei de peste 55 de ani (63%) au cea mai mare încredere (Reveal, 2023).
- **Aproximativ un sfert** nu fac plăți online de teamă că le sunt furate datele. Pentru noi, „nu legi banca, nu faci cont" e un argument de design, nu doar tehnic.
- Revolut are peste 5 milioane de clienți retail în România, deci publicul e obișnuit cu standardul vizual al neobăncilor: curat, rapid, mobil-first.

## Ce înseamnă pentru „Ce înseamnă pentru mine"

| Tipar din industrie | Cum îl aplicăm |
|---|---|
| Cifră concretă în hero (Wise) | Hero-ul arată impactul în lei/lună pentru un profil demo, nu o frază generică |
| Widget interactiv sus (Wise, Yomoni) | Cele 4 întrebări *sunt* widget-ul. Rezultatul apare cât mai repede |
| Un singur CTA | „Vezi ce te privește", nimic altceva concurent |
| Paletă neutră + un accent | Fundal deschis, text aproape negru, un accent de brand. Roșu/verde doar pentru cost/economie, mereu cu semn |
| Cifre tabulare, `ro-RO` | Toate sumele prin `Intl.NumberFormat('ro-RO', {style:'currency', currency:'RON'})`, `tabular-nums` pe bara „Planul meu" |
| Proiecțiile etichetate ca atare | Cardurile simulate au o stare vizuală distinctă („simulare") față de impactul sigur |
| Disclaimer lângă cifră | „Scenariu educațional, nu consultanță" lângă total, nu doar în footer |
| Surse vizibile (pagina de securitate Plaid) | Fiecare card are sursa + „verificat la <dată>"; o pagină „De unde vin cifrele" |
| Securitate lângă CTA | „Fără cont · fără bancă · rămâne pe telefonul tău" chiar sub buton |
| Mișcare reținută | O singură animație: recalcularea barei când pornești un comutator (scurtă, cu fallback reduced-motion) |
| Limbaj simplu | Fiecare regulă are o frază „de ce" pe înțelesul oricui; termenul tehnic doar ca etichetă secundară |
| Onestitate (transparența Ramify, Nalo) | „Termen depășit" rămâne vizibil, estompat. E un diferențiator, păstrăm |

### De evitat
- Gradienți și 3D ca element principal (riscăm să părem aplicație de crypto).
- Text gri deschis pentru disclaimere.
- Mai mult de un buton primar pe ecran.
- Sume fără unitate sau fără perioadă („200" în loc de „−200 lei/lună").
- Animații de numere care „se rotesc" mult; utilizatorul vrea cifra, nu spectacolul.

---

# Partea a doua: ce funcționează în spațiul de știri

Produsul nostru e un hibrid: **conținutul e de știri** (ce s-a schimbat în lege, de când), **forma e de fintech** (cât te costă, ce faci). De aceea contează și ce au învățat redacțiile despre cum citesc oamenii.

## TL;DR: profilul cititorului de știri

Cititorul de știri **scanează, nu citește**, e **obosit de știri** și **nu mai are încredere ușor**. Îi place:

1. **Concluzia întâi.** Ce s-a întâmplat și de ce contează, în primele rânduri. Restul e opțional.
2. **Scurt și structurat.** Paragrafe scurte, bold pe ideile-cheie, liste, subtitluri care spun ceva.
3. **Context, nu doar noutate.** Ce s-a întâmplat înainte și ce urmează, ca o cronologie, nu ca articole răzlețe.
4. **Ton constructiv.** Știrile care îl apasă îl fac să le evite. Îl ajută cele care îi spun ce poate face.
5. **Transparență.** Cine a scris, de unde e informația, când a fost actualizată, ce tip de conținut e (știre, analiză sau opinie).

## Ce spun datele

- **79% dintre utilizatori scanează** orice pagină nouă, nu o citesc (NN/g). Recomandarea veche și încă valabilă: piramida inversată, subtitluri cu sens, liste, o idee pe paragraf.
- **Axios** (date proprii ale companiei, neverificate independent): 80% dintre cititori abandonează după ~350 de cuvinte; timpul mediu pe articol e de ~26 de secunde. Formatul „Smart Brevity" a răspuns cu unități scurte: titlu, o frază și etichete îngroșate de tipul **„De ce contează"**.
- **Evitarea știrilor crește:** în medie ~40% dintre oameni evită știrile uneori sau des, față de 29% în 2017 (Reuters Institute). În Germania, în 2026, 72%; motivul principal e că **știrile le strică starea**. Cercetătorii recomandă **jurnalism constructiv, orientat spre soluții**, nu doar „vești bune".
- **Indicatorii de încredere funcționează:** într-un experiment cu peste 1.100 de participanți (Trust Project / Center for Media Engagement), articolele cu indicatori de transparență au fost percepute ca mai de încredere. Cel mai observat indicator a fost **„de ce am scris acest articol"** (44%).
- **Formatele de explicare care merg:** cronologii, ghiduri interactive, întrebări și răspunsuri (Vox), diagrame de decizie. Problema clasică a presei: arhiva pe un subiect (ex. Brexit) e o grămadă de articole fără ordine; cititorul trebuie să-și construiască singur povestea.

## Contextul românesc (Digital News Report 2026)

- Televiziunea e sursa principală pentru **58%**. Pro TV are 60% reach săptămânal, Antena 1 și Digi24 câte 38%.
- **Doar 2 din 10** români au încredere în informațiile de pe rețelele sociale; **peste jumătate** sunt îngrijorați de dezinformare.
- Încrederea în presă era ~26% în 2025 (media globală ~40%), iar evitarea intenționată a știrilor ~49%.
- **8 din 10** au consumat video online în ultima săptămână.

Pe scurt: românii află despre schimbările fiscale din titluri de TV și de pe Facebook, surse în care au puțină încredere și care nu le spun nimic personalizat. Asta e golul pe care îl umplem.

## Tipare care se repetă pe site-urile de știri bune

- **Titlu care spune faptul, nu îl ascunde.** Fără clickbait; titlul e informația.
- **Rezumat sus** (lead, „pe scurt", „key points" la BBC/FT).
- **Etichete îngroșate de context:** „De ce contează", „Ce urmează", „Pe scurt" (Axios).
- **Data publicării + „actualizat la"**, vizibile lângă titlu.
- **Eticheta tipului de conținut:** știre / analiză / opinie / explicativ.
- **Sursele citate și linkate** în text, nu doar la final.
- **Cronologie sau „povestea până acum"** pentru subiectele care evoluează.
- **Tipografie de lectură:** coloană îngustă (~60–75 de caractere pe rând), corp de text generos (17–20px), interliniere aerisită; adesea un serif pentru titluri, care dă „gravitate editorială".
- **Ierarhie prin mărime și spațiu**, nu prin culoare. Meniu scurt, 5–7 elemente.

---

# Combo-ul: fintech × știri pentru „Ce înseamnă pentru mine"

Cele două profiluri se suprapun mult: amândouă vor **concluzia întâi, cifre concrete, surse vizibile și calm**. Diferența: fintech-ul aduce **personalizarea și interactivitatea**, știrile aduc **contextul în timp și transparența editorială**.

| De la știri | De la fintech | Rezultatul pentru noi |
|---|---|---|
| Titlul spune faptul | Cifra concretă în hero | Titlul cardului = faptul + suma: „Dividendele: impozit 16% · −85 lei/lună" |
| „De ce contează" (Axios) | Limbaj simplu | Fiecare card are o frază îngroșată **„Pentru tine:"** + explicația |
| „Ce urmează" | CTA unic, acțiune clară | **„Ce poți face până la <dată>:"** cu comutatorul de simulare |
| Cronologie / „povestea până acum" | Status clar (în vigoare / urmează) | Cronologia e coloana vertebrală; „în vigoare", „urmează" și „termen depășit" sunt vizibil diferite |
| „Actualizat la" + surse linkate | Transparență, pagină de securitate | „Sursa: Monitorul Oficial · verificat la 28 oct 2026", cu link |
| Eticheta tipului de conținut | Proiecțiile etichetate ca atare | Etichete clare: „lege în vigoare", „simulare", „estimare" |
| Jurnalism constructiv vs. evitare | Senzația de control | Fiecare veste proastă vine **cu o acțiune**. Nu lăsăm utilizatorul doar cu cifra negativă |
| „De ce am scris asta" (Trust Project) | Real-world feel | O pagină scurtă „Cum lucrăm": de unde vin regulile, cum calculăm, ce nu facem |
| Tipografie de lectură | Sans neutru + cifre tabulare | **Serif pentru titlurile cardurilor** (gravitate de știre) + **sans neutru pentru UI și cifre** (precizie de fintech) |
| Scanabilitate, paragrafe scurte | O idee pe ecran | Card = titlu + sumă + o frază + o acțiune. Detaliile stau într-un „Află mai multe" pliat |

### Anatomia unui card (sinteza celor două)

```
┌─────────────────────────────────────────────┐
│ ÎN VIGOARE · 1 ian 2026                       │  ← etichetă stare + dată (știri)
│ Impozitul pe dividende crește la 16%          │  ← titlul = faptul (știri, serif)
│                               −85 lei/lună    │  ← sumă mare, tabulară, cu semn (fintech)
│ Pentru tine: încasezi ~1.400 lei dividende    │  ← „de ce contează" (Axios)
│ lunar, deci plătești cu 6 puncte mai mult.    │
│ ─────────────────────────────────────────── │
│ Ce poți face până la 31 dec 2026   [ ○ ]     │  ← acțiune datată + simulare (fintech)
│ Sursa: Monitorul Oficial · verif. 28 oct 2026 │  ← transparență (știri)
└─────────────────────────────────────────────┘
```

*(Cifrele din schiță sunt ilustrative.)*

### De evitat din lumea știrilor
- Titluri alarmiste („Lovitură pentru buzunarul românilor!"). Asta e exact tonul de care oamenii fug.
- Ziduri de text; orice explicație peste ~3 rânduri se pliază.
- Știri fără acțiune; contribuie la oboseala care duce la evitarea știrilor.
- Ordinea neclară a evenimentelor; cronologia trebuie să fie evidentă dintr-o privire.

## Surse

**Fintech**
- [Utsubo: Trust Design Patterns for Fintech Websites (12 semnale)](https://www.utsubo.com/blog/fintech-website-trust-design-patterns)
- [Digidop: 2026 Design Trends for Finance Websites](https://www.digidop.com/blog/2026-design-trends-for-finance-websites)
- [Veza Digital: Fintech & Finance Web Design Trends 2026](https://www.vezadigital.com/post/fintech-web-design-trends)
- [Azuro Digital: 10 Web Design Tips for Fintech Companies in 2026](https://azurodigital.com/fintech-web-design-tips/)
- [Element8: Top Finance Website Design Trends 2026](https://www.element8.ae/blogs/top-finance-website-design-trends)
- [Design Monks: Best Fintech Website Design Examples](https://www.designmonks.co/blog/best-fintech-website-design-examples)
- [AdminLTE: Fintech Dashboard Design Examples](https://adminlte.io/blog/fintech-dashboard-design-examples/)
- [Finance & Fintech Design Patterns (get-design-done)](https://cdn.jsdelivr.net/npm/@hegemonart/get-design-done@1.60.4/reference/domains/finance-patterns.md)
- [CleverX: How to Test Fintech Apps for Trust and Security UX](https://cleverx.com/blog/how-to-test-fintech-apps-for-trust-and-security-ux/)
- [Agile Brand Guide: Trust by Design](https://agilebrandguide.com/trust-by-design-how-fintech-ux-shapes-brand-perception/)
- [NN/g: How Can We Study Website Credibility?](https://www.nngroup.com/videos/website-credibility/)
- [Measuring Online Trust of Websites: Credibility, Perceived Ease of Use, and Risk](https://www.scinapse.io/papers/46967924)
- [Revista Biz: Românii se simt în siguranță când folosesc aplicațiile de banking](https://www.revistabiz.ro/studiu-romanii-se-simt-in-siguranta-atunci-cand-folosesc-aplicatiile-de-banking/)
- [Știripesurse: 26% dintre români nu plătesc online de teama furtului de date](https://www.stiripesurse.ro/studiu-26prc-dintre-romani-nu-efectueaza-plati-online-de-teama-furtului-datelor-personale_1523885.html)

**Spațiul de știri**
- [Reuters Institute: Digital News Report 2026 (PDF)](https://reutersinstitute.politics.ox.ac.uk/sites/default/files/2026-06/DNR%202026%20FINAL_2.pdf)
- [Forbes România: consumul de știri în România, DNR 2026](https://www.forbes.ro/consumul-de-stiri-in-romania-televiziunile-rezista-dar-platformele-sociale-devin-principalul-canal-de-informare-506544)
- [RRI: Radio România, locul 2 la încredere (DNR 2025)](https://www.romania-actualitati.ro/news-in-english/radio-romania-news-ranks-second-in-terms-of-trust-in-media-brands-id212325.html)
- [Leibniz-HBI: Why more and more people are avoiding the news](https://leibniz-hbi.de/en/hbi-news/news/why-more-and-more-people-are-avoiding-the-news/)
- [Voronoi: News avoidance on the rise](https://www.voronoiapp.com/public-opinion/Too-Much-Bad-News-News-Avoidance-on-the-Rise-5478)
- [Journalism.co.uk: How Axios is reinventing text journalism with Smart Brevity](https://www.journalism.co.uk/how-axios-is-reinventing-text-journalism-with-smart-brevity/)
- [INMA: Axios reaches today's reader with Smart Brevity](https://www.inma.org/blogs/conference/post.cfm/axios-reaches-today-s-reader-with-smart-brevity-journalism)
- [Axios HQ: Smart Brevity guidance](https://axioshq.com/features/smart-brevity-guidance)
- [Trust Project: Trust Indicators boost perceptions of credibility](https://thetrustproject.org/?p=527)
- [Nieman Lab: trust indicators research](https://www.niemanlab.org/2018/09/just-because-clickthrough-rates-are-low-doesnt-mean-you-cant-do-anything-about-them/audiences-seem-a-little-more-likely-to-find-news-credible-when-trust-indicators-are-attached-to-it-now-lets-test-this-in-the-wild/)
- [How users read on the web (NN/g, 79% scanează)](https://bunny.deceptive.design/articles/how-users-read-on-the-web)
- [Newcastle University Design System: readability](https://www.ncl.ac.uk/design-system/ux/editorial/readability/)
- [Contently: How the explainer changed digital media](https://contently.com/2019/01/23/explainer-changed-digital-media/)
- [Datadog: What product designers can learn from explanatory journalism](https://datadoghq.com/blog/engineering/what-product-designers-can-learn-from-explanatory-journalism)
- [IJNet: Five ways tech enhances explanatory journalism](https://ijnet.org/fr/node/2110)
