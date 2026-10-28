# Ce înseamnă pentru mine

*Fiecare schimbare de regulă, tradusă în lei pe lună pentru tine, cu o acțiune și o dată limită.*

## Ce este

Ce înseamnă pentru mine este o aplicație care îți arată ce se schimbă în legi și taxe și cât te costă pe tine, personal.

Răspunzi la patru întrebări: cum câștigi (angajat, PFA, SRL cu dividende sau pensionar), cât câștigi net, unde locuiești (chirie, casă proprie sau ipotecă) și dacă ai Pilon II și Pilon III.

Primești o cronologie cu schimbările care te privesc, de exemplu TVA de 21%, dividende taxate la 16% sau microîntreprinderea cu cotă unică de 1% și plafon de 100.000 EUR. Fiecare are o dată, un impact în lei pe lună, o frază care explică de ce și o acțiune cu termen. Poți porni o acțiune ca simulare și vezi imediat cum se schimbă impactul.

Nu ai nevoie de cont bancar și nu legi nimic. Îți completezi profilul de mână, în sub un minut, iar el rămâne pe telefonul tău.

## Audiența, nevoia financiară, experiența produsului

**Audiența.** Români între 25 și 50 de ani care câștigă și sunt loviți de schimbările de reguli: salariați, cei cu venit secundar prin PFA sau SRL, deținători de Pilon II. Persona principală este angajatul cu venit secundar.

**Nevoia financiară.** Claritate asupra schimbărilor care urmează, la banii proprii, în lei pe lună, cu o acțiune datată. Nu este buget personal și nu este consultanță de investiții.

**Experiența produsului.** Patru întrebări, o cronologie, acțiuni simulate, apoi „Planul meu".

## Ce demonstrăm

### 4.1 Pe cine servește și ce problemă rezolvă

Servește oameni care câștigă și află despre schimbări din titluri de presă. Durerea financiară din 2025–2026 nu este bugetarea, ci volatilitatea regulilor. În mai puțin de un an s-au schimbat TVA, impozitul pe dividende, CASS la pensii, plafonarea energiei, regimul microîntreprinderilor și plata Pilonului II. Nimeni nu spune pe înțelesul fiecăruia: ce înseamnă asta pentru banii mei și ce fac până la data X?

### 4.2 Cum funcționează experiența de la cap la coadă

1. **Profilul.** Patru întrebări, sub un minut, fără cont și fără bancă.
2. **Cronologia.** Apar doar regulile care se aplică ție, în ordine cronologică. Cronologia amestecă cardurile „în vigoare" și „urmează". Un termen deja depășit rămâne vizibil, estompat, ca „termen depășit", cu ce ai fi economisit. Produsul arată onest ce s-a pierdut.
3. **Simularea.** Fiecare acțiune are un comutator. Exemplul din demo: „Înainte de 31 dec 2026: alimentează Pilon III până la plafonul deductibil de 400 EUR/an (≈200 lei economie la impozit)", legat de reforma plății Pilonului II, care se aplică de la 5 ianuarie 2027. Când pornești comutatorul, cardul, titlul și bara se recalculează pe loc.
4. **Planul meu.** O bară fixă arată impactul fără acțiuni și cu acțiunile alese, plus următorul termen. Titlul și bara se recalculează live; nicio sumă totală nu e scrisă de mână. Fereastra de 12 luni numără doar lunile de după data intrării în vigoare a fiecărei reguli.

Demonstrația are trei profiluri: Andrei, 32 de ani, angajat cu dividende de la un SRL; Maria, 45, PFA cu ipotecă pe IRCC; Ion, 67, pensionar. Fiecare vede o cronologie diferită.

### 4.3 De ce este relevant în România

Volatilitatea fiscală este concretă. Schimbările din ultimul an și jumătate:

- TVA de la 19% la 21%, cotele reduse unificate la 11% (august 2025)
- impozitul pe dividende de la 10% la 16% (ianuarie 2026)
- CASS de 10% la pensiile peste 3.000 lei (august 2025)
- plafonarea prețului la energia electrică eliminată (iulie 2025)
- plafonarea prețului la gaz pentru casnici prelungită până la 31 martie 2027
- microîntreprinderi: cotă unică 1%, plafon 100.000 EUR (ianuarie 2026)
- plata Pilonului II rescrisă prin Legea 2/2026, aplicabilă din 5 ianuarie 2027: până la 30% o dată, restul eșalonat

România s-ar afla pe locul 35 din 39 în sondajul OECD/INFE 2023 privind educația financiară a adulților (sursă secundară; scorul exact nu a fost reconfirmat). În același timp, Revolut a anunțat peste 5 milioane de clienți retail în România (septembrie 2026; cifră raportată de companie, clienți înregistrați, nu activi). Oamenii au telefonul și banii digitali, dar află despre schimbări din titluri, nu dintr-un instrument care le personalizează.

### 4.4 Ipoteze, surse de date, aspecte de reglementare, limitări

**Ipoteze**
- Cheltuielile se bazează pe medii.
- Cifrele din demo sunt ilustrative.
- Regulile sunt codificate la data de 28 octombrie 2026.

**Surse**
- Monitorul Oficial, ANAF, ASF, ANRE, BNR, INS.
- Fiecare regulă citează o sursă și afișează „verificat la <dată>".

**Reglementare**
- Scenarii educaționale, nu consultanță financiară. Pentru informare nu ar fi nevoie de licență ASF sau BNR (de confirmat cu un jurist).
- Fără date din conturi bancare, fără PSD2.
- GDPR: profilul rămâne pe dispozitiv, nimic nu se stochează pe server.

**Limitări**
- Set restrâns de reguli: șapte în demo.
- Nu depunem declarații fiscale.
- Nu oferim interpretare juridică.
- Cifrele cer reverificare periodică.

## Integrat sau de sine stătător?

Azi este o aplicație web de sine stătătoare, pentru că așa o putem testa cu oameni reali. Motorul de reguli este însă un modul pur: primește un profil JSON și întoarce o listă de impacturi. Nu depinde de interfață. Aceeași logică poate rula într-un widget din aplicația unei bănci, a unui neobanc, a unui furnizor de salarizare sau a unei aplicații de contabilitate. De sine stătător azi, integrabil mâine. Integrarea Stripe nu face parte din această versiune.

## Scheletul pitch-ului

| Criteriu (pondere) | Moment din pitch sau demo |
|---|---|
| Potrivire cu provocarea și diferențiere (20%) | Slide 2: nu bugetare, ci volatilitate de reguli; cele șapte schimbări |
| Experiența utilizatorului (25%) | Demo live: patru întrebări, cronologie, comutator de simulare, bara „Planul meu"; trei profiluri |
| Implementare tehnică (25%) | Comutatorul schimbă titlul în direct; motorul de reguli este cod testabil, nu slide-uri |
| Livrare și pitch (20%) | O poveste: Pilon III înainte de 31 decembrie 2026; fiecare cifră are sursă |
| Mentorat de business (10%) | Problema și utilizatorul, valoarea în lei, adopție prin widget la bănci și aplicații de salarizare |

## Surse

Șapte reguli din demo.

1. TVA 19% → 21% (și cotele reduse 5%/9% unificate la 11%), de la 1 aug 2025, Legea 141/2025 (MO 699/25 iul 2025). Sursă: https://www.ey.com/en_gl/technical/tax-alerts/romanian-tax-changes-introduced-by-new-fiscal-and-budgetary-measures
2. Impozit pe dividende 10% → 16%, dividende distribuite de la 1 ian 2026, Legea 141/2025. Sursă: https://static.anaf.ro/static/10/Galati/Vrancea/Modif-imp-dividende-Legea-141-25.pdf
3. CASS 10% pe pensii peste 3.000 lei/lună (partea care depășește), de la 1 aug 2025, Legea 141/2025. Sursă: https://www.contzilla.ro/exemplu-de-calcul-cass-la-pensii-peste-3-000-lei/
4. Plafonarea prețului la energie electrică eliminată de la 1 iul 2025. Sursă: https://www.bursa.ro/plafonarea-preturilor-la-energiei-electrica-inceteaza-de-la-1-iulie-62861658
5. Plafonarea prețului la gaz pentru casnici prelungită 1 apr 2026 – 31 mar 2027 (0,31 lei/kWh), OUG 12/2026; expiră 31 mar 2027. Sursă: https://www.puterea.ro/?p=557629 (notă: un articol o descrie ca proiect, altul ca adoptată; de reconfirmat)
6. Pilon II: plată eșalonată, Legea 2/2026 (MO 2/5 ian 2026), se aplică de la 5 ian 2027: până la 30% dintr-o dată, restul lunar pe minimum 8 ani sau rentă viageră. Sursă: https://www.asfromania.ro/uploads/articole/attachments/6a5a01012ff41241294550.pdf și https://hotnews.ro/?p=2148208
7. Microîntreprinderi 2026: cotă unică 1% (cota de 3% eliminată), plafon 100.000 EUR, minimum un angajat, OUG 89/2025 + OUG 8/2026, de la 1 ian 2026. Sursă: https://www.fiscalitatea.ro/microintreprinderi-2026-ultimul-an-in-care-termenul-limita-pentru-plata-impozitului-este-25-iunie-24852/

Textele din Monitorul Oficial nu au fost deschise direct; sursele sunt sinteze ANAF/ASF/EY/presă. De reconfirmat înainte de prezentare.

Surse pentru secțiunea 4.3: educație financiară, https://oecd.org/en/publications/oecd-infe-2023-international-survey-of-adult-financial-literacy_56003a32-en.html; adopție digitală, https://www.romania-insider.com/revolut-reaches-5-mln-retail-customers-romania-plans
