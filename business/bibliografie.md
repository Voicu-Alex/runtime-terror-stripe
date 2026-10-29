# Bibliografie verificată: monetizare și profesioniști

**Notă de statut, 29 octombrie 2026:** această bibliografie păstrează cercetarea și afirmațiile istorice din 28 octombrie; nu stabilește oferta curentă. Tarifele vechi și modelul cu trial sunt înlocuite de [freemium la 15 lei/lună pentru Pro](model-de-business.md), conform [ADR 0003](../docs/adr/0003-freemium-valoare-verificata.md) și [ADR 0004](../docs/adr/0004-recompense-teasere-notificari.md). Statisticile de trial și vechile calcule de venit nu sunt prognoze pentru noul model. Sursele istorice nu au fost reverificate prin această actualizare; resursele consultate în discuția nouă sunt separate mai jos.

## Surse pentru deciziile de freemium din 29 octombrie 2026

Deciziile de produs provin din confirmările lui Andrei: deblocare suplimentară unică pentru profil complet, cont gratuit la revendicare, teasere verificabile, exemple distincte de profilul real, consum la dezvăluire fără restituire automată, voce opțională și comunicări cu opt-in separat. Prețul de 15 lei/lună provine din ADR 0002; 180 lei este calculul pentru 12 luni, nu o statistică sau un tarif anual nou.

| Întrebare | Resurse primare consultate în discuție | Consecință pentru produs |
|---|---|---|
| Ce înseamnă venitul statistic? | [Eurostat EU-SILC: metodologie](https://ec.europa.eu/eurostat/web/income-and-living-conditions/methodology) | Venitul disponibil echivalat al gospodăriei nu se prezintă drept salariul net individual. |
| Putem folosi o mediană salarială drept venit net lunar? | [Eurostat: median hourly earnings, earn_ses_pub2s](https://ec.europa.eu/eurostat/databrowser/product/view/earn_ses_pub2s?category=labour.earn.earn_ses_main.earn_ses_pub.earn_ses_pub2) | Seria despre câștiguri orare brute nu este direct un salariu lunar net; nu facem conversii fără ipoteze verificate. |
| Cheltuielile sunt medii sau mediane? | [Eurostat: household expenditure, hbs_exp_t111](https://ec.europa.eu/eurostat/databrowser/view/hbs_exp_t111%24defaultview/default/table?lang=en) | Media cheltuielilor gospodăriei/adultului echivalent nu se numește mediană individuală. |
| Emailuri după un cont gratuit | [Portal Legislativ: cadrul comunicărilor electronice](https://legislatie.just.ro/Public/DetaliiDocument/288598), [CJUE: sinteza din noiembrie 2025, Inteligo Media, pp. 9–12](https://curia.europa.eu/site/upload/docs/application/pdf/2025-12/monthly_case-law_digest_en_-_november_2025.pdf), [EDPB: ghidul consimțământului](https://www.edpb.europa.eu/documents/guideline/guidelines-052020-on-consent-under-regulation-2016679_en) | Alegem explicit opt-in separat, fără a afirma că orice cont gratuit este exclus din toate excepțiile legale. Digestul nu este considerat automat mesaj tranzacțional doar fiindcă include informații. |
| Procesarea conversației vocale | [ElevenLabs: privacy controls](https://elevenlabs.io/docs/agents-platform/customization/privacy), [termenii agenților](https://elevenlabs.io/agents-terms) | Informare înainte de interacțiune, configurare deliberată a retenției și formular manual alternativ. Nu promitem procesare locală sau absența păstrării fără verificare. |

Nu a fost verificată o pereche actuală, cu definiții compatibile, de mediane românești pentru salariu net lunar și cheltuieli personale. Accesarea directă a PDF-urilor INS a eșuat în această verificare. **Valorile numerice pentru exemple rămân TODO** până la confirmarea populației, perioadei, monedei și unității fiecărei serii. Nu le transferăm în profilul real și nu le folosim pentru pragul Pro.

## Cercetarea istorică din 28 octombrie 2026

*Verificat pe 28 octombrie 2026 de Chris (cu Claude). Acoperă `business/monetizare.md` (v3) și `business/profesionisti.md` (v2). Corecturile de mai jos sunt aplicate în `business/model-de-business.md` (versiunea unificată, care înlocuiește `monetizare.md`), în `business/slide-cum-facem-bani.md` și în `business/profesionisti.md` (v3).*

**Metoda.** Am deschis fiecare link de mai jos în ziua verificării și am comparat ce scrie pe pagină cu afirmația din document. Am folosit sursa primară (site-ul autorității, al organismului profesional, textul legii pe legislatie.just.ro, pagina oficială de prețuri sau raportul original). Presa apare doar acolo unde nu am găsit sursa primară și e marcată ca „sursă secundară”. Ce nu am găsit rămâne `TODO`, conform regulii „Nimic inventat” din `CLAUDE.md`.

**Legendă status:** ✓ verificat · ⚠ sursă secundară · ⚠ veche (anul) · ✗ nu se încarcă · `TODO` · ⏳ în lucru

---

## 1. Prețuri de referință

### 1.1 Biziday

- **Afirmația:** „Biziday (15 lei/lună după organizator; prețul real e `TODO`)” (`monetizare.md`, §1).
- **Surse deschise:**
  - [Biziday în App Store România](https://apps.apple.com/ro/app/biziday/id1164239111?l=ro): aplicația e „Gratis” și nu are nicio achiziție în aplicație listată. Versiunea 3.0.1 e din 01.04.2024.
  - [Biziday, pagina „Susține”](https://www.biziday.ro/sustine/): contribuții „Lunar” sau „O dată”. Sumele propuse sunt 20, 50, 100, 250 și 500 lei, respectiv 10, 25, 50, 100 și 250 lei, plus „Altă valoare”. Pagina nu spune ce sumă e lunară și ce sumă e unică. Nu e descris niciun beneficiu pentru susținători (fără reclame, funcții premium): după plată apare doar „Mulțumim!”.
  - Google Play (`play.google.com/store/apps/details?id=ro.biziday`): pagina nu a putut fi citită automat (✗).
- **Data:** pagini văzute pe 28.10.2026.
- **Status:** ✓ pentru „nu există abonament”. **Biziday nu are un abonament de 15 lei.** Aplicația e gratuită, iar banii vin din donații voluntare cu sume alese de cititor (minimul prestabilit e 10 lei o dată sau, cel mai probabil, 20 lei lunar). Ce primești în schimbul donației: nimic în plus, conform paginii.

### 1.2 Spotify Premium România

- **Afirmația:** „299 lei/an ≈ 25 lei/lună, cam cât Spotify (26 lei, Newsweek RO)” (`monetizare.md`, §1).
- **Link:** [Spotify Premium, România](https://www.spotify.com/ro-ro/premium/)
- **Ce spune:** Individual „0 RON pentru 1 lună, apoi 26 RON pe lună”. Duo 35 RON/lună, Family 42 RON/lună, Student 14 RON/lună (după o lună gratuită).
- **Data:** pagină curentă, văzută pe 28.10.2026.
- **Status:** ✓. Cifra de 26 lei e corectă, dar trebuie citată pagina oficială, nu Newsweek (vezi Corecturi).

### 1.3 Revolut România

- **Afirmația:** nu apare în documente. Cerută ca reper de preț.
- **Linkuri încercate:** `revolut.com/ro-RO/our-pricing-plans/`, `revolut.com/en-RO/our-pricing-plans/`, `revolut.com/ro-RO/plans/`, `revolut.com/ro-RO/`, `help.revolut.com/.../plus-plan/`, `help.revolut.com/.../ultra-plan1/`.
- **Status:** ✗ toate întorc **403 Forbidden** la accesul automat. Prețurile din rezultatele de căutare (Plus 19,99 lei, Premium 39,99 lei, Metal 72,99 lei, Ultra 260 lei pe lună) **nu sunt verificate**, deci nu le folosim. `TODO`: verificare manuală în browser.

### 1.4 Netflix România

- **Afirmația:** nu apare în documente. Cerută ca reper de preț.
- **Link:** [Abonamente și tarife, Asistență Netflix](https://help.netflix.com/ro/node/24926/ro)
- **Ce spune:** „Minim: 5,99 euro/lună”, „Standard: 10,99 euro/lună”, „Premium: 13,99 euro/lună”, cu membru suplimentar la 3,99 euro/lună pentru Standard și Premium.
- **Data:** pagina nu are dată.
- **Status:** ⚠ **Pagina nu numește țara.** Netflix afișează prețurile după locația celui care o deschide („Trebuie selectată o țară…”), iar accesul automat nu garantează locația România. Cifrele sunt în euro, ceea ce e plauzibil pentru România, dar nu e confirmat. Nu le folosim în pitch fără o verificare manuală din România.

### 1.5 Salariul mediu net (INS)

- **Afirmația:** nu apare explicit în documente. Cerută ca reper pentru prețul abonamentului.
- **Link:** [INS, Comunicat de presă nr. 262 din 13 octombrie 2026: „Câștigul salarial mediu brut pe economie în luna august 2026 a fost 9497 lei și cel net 5688 lei”](https://insse.ro/cms/sites/default/files/com_presa/com_pdf/cs08r26.pdf)
- **Ce spune:** „Câştigul salarial mediu net a fost 5688 lei, în scădere cu 132 lei (-2,3%) față de luna iulie 2026.” Față de august 2025, creșterea e de +5,6%. Cel mai mare câștig net e în IT (13.010 lei), iar următorul comunicat apare pe 12 noiembrie 2026.
- **Data:** 13.10.2026 (date pentru august 2026). E cel mai recent comunicat la data verificării.
- **Status:** ✓. **Notă tehnică:** WebFetch a eșuat pe insse.ro („unable to verify the first certificate”), iar PDF-ul a fost descărcat și citit direct.
- **Calcul util pentru pitch:** 299 lei/an ≈ 24,9 lei/lună ≈ **0,44%** din salariul mediu net. 49,99 lei/lună ≈ **0,88%**.

---

## 2. Date despre abonamente

### 2.1 RevenueCat, State of Subscription Apps 2026

- **Link:** [RevenueCat, State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps)
- **Data:** ediția 2026, cu date pentru anul calendaristic 2025. Pagina nu are o dată de publicare (imaginile sunt din martie 2026).

| Afirmația din `monetizare.md` | Ce spune exact raportul | Status |
|---|---|---|
| „Un paywall strict convertește de ~5 ori mai bine la 35 de zile decât freemium” | „Hard paywalls convert 5× better than freemium, but with significantly wider variance.” Mediana download→plată la ziua 35 e **10,7%** pentru hard paywall și **2,1%** pentru freemium. | ✓ (de adăugat: „cu variație mult mai mare”) |
| „Probele de 17–32 de zile au cea mai bună conversie” | Trialurile de 17–32 de zile au mediana trial→plată **42,5%**, iar cele de ≤4 zile **25,5%**. „17–32 day trials outperform short trials by ~17pp at median.” Atenție: doar **5,0%** dintre trialuri au 17–32 de zile (în scădere de la 6,1%). | ✓ |
| „55% dintre anulări au loc în ziua 0” | „55% of all **3-day** trial cancellations happen on Day 0.” Pentru trialurile de **30 de zile** procentul e **31,1%**, pentru 14 zile 35,7%, pentru 7 zile 39,8%. | ⚠ **Citată greșit** (vezi Corecturi) |
| „datele RevenueCat arată 25–45% de la probă la plată” | Raportul nu dă o mediană generală. Pe regiuni: America de Nord 34,2%, Asia-Pacific 31,9%, Europa de Vest 29,7%, India/SE Asia 15,2%, America Latină/MEA/restul lumii ≈ 20–23%. Europa de Est nu e raportată separat (intră la „ROW”). | ⚠ Intervalul 25–45% nu apare ca atare (vezi Corecturi) |
| „pentru piețe cu putere de cumpărare mai mare” | Raportul pune decalajul pe seama geografiei. Puterea de cumpărare e legată de venitul per instalare, nu de conversia trialului. | ⚠ formulare de nuanțat |

### 2.2 Disponibilitatea românilor de a plăti pentru aplicații

- **Afirmația:** „românii plătesc greu pentru aplicații ([Statista](https://www.statista.com/statistics/1265685/romania-willingness-to-pay-for-mobile-phone-apps))” (`monetizare.md`, §1).
- **Sursa citată:** [Statista, Romania: willingness to pay for mobile phone apps 2020](https://www.statista.com/statistics/1265685/romania-willingness-to-pay-for-mobile-phone-apps). Sondajul e din **2020**, ultima actualizare 4 oct. 2021. Procentul e ascuns după paywall („Only ** percent…”), iar pagina spune doar că „the majority of Romanians surveyed … were not willing to pay”. **Status:** ⚠ veche (2020) și cifra nu e vizibilă.
- **Sursă mai nouă, primară:** [Eurostat, setul de date isoc_ec_ibgs „Internet purchases - goods or services (2020 onwards)”](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/isoc_ec_ibgs?format=JSON&lang=en&geo=RO&geo=EU27_2020&time=2025&ind_type=IND_TOTAL), actualizat pe 17.04.2026, cu date pentru 2025. Procentele sunt din persoanele de 16–74 de ani care au folosit internetul în ultimele 3 luni (PC_IND_IU3):

| Abonament plătit (2025) | România | UE-27 |
|---|---|---|
| Alte aplicații (I_BAPP2) | **2,82%** | 7,02% |
| Aplicații de sănătate/fitness (I_BHLFTS2) | 4,23% | 5,77% |
| Muzică în streaming (I_BMUSS2) | 10,09% | 23,03% |
| Filme/seriale/sport în streaming (I_BFLMS2) | 21,37% | 32,68% |
| Presă online (I_BBOOKNLS2) | 4,71% | 7,23% |

  Etichetele indicatorilor sunt traduse de noi după codurile Eurostat. **Status:** ✓ (sursă primară, 2025).
- **Context UE:** [Eurostat news, „Films, series & sports: top choice for paid subscriptions”, 27.08.2026](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260827-1): 32,7% din utilizatorii UE plătesc pentru video, 23,0% pentru muzică, 7,2% pentru presă. Știrea nu dă cifre pentru România. **Status:** ✓.
- **Secundar:** [Curs de Guvernare, 06.09.2026](https://cursdeguvernare.ro/economia-abonamentelor-digitale-214-dintre-romani-platesc-pentru-video-101-pentru-muzica-si-47-pentru-presa-decalajele-fata-de-media-ue.html) dă aceleași cifre pentru România (21,4 / 10,1 / 4,7%), preluate dintr-o analiză Banca Transilvania. **Status:** ⚠ sursă secundară, confirmată de datele Eurostat de mai sus.

---

## 3. Reguli ale profesiilor și registre publice

### 3.1 CECCAR (experți contabili, contabili autorizați)

- **Afirmația:** „Sunt interzise ofertele care acordă «remize din onorariu, comisioane, tarife reduse sau alte avantaje», precum și publicitatea comparativă. Text preluat dintr-o reproducere a codului, ediția nu e clară” (`profesionisti.md`, §2).
- **Codul în vigoare:** [CECCAR, Codul etic național al profesioniștilor contabili, ediția a V-a (PDF pe ceccar.ro)](https://ceccar.ro/ro/wp-content/uploads/2011/09/Codul_etic_2011.pdf). Pagina [„Etică” de pe ceccar.ro](https://ceccar.ro/ro/?page_id=71) îl listează ca singurul cod etic.
  - Ediția a V-a a fost aprobată prin Hotărârea Consiliului Superior CECCAR nr. 11/216 din 31.03.2011 și e obligatorie „începând cu data de 1 ianuarie 2011”. Pct. 9 din hotărâre: „se abrogă prevederile Hotărârii nr. 07/80 din 25 mai 2007”.
  - **Secțiunea 250, Marketingul serviciilor profesionale (250.2):** profesionistul „nu trebuie: (a) să exagereze calitatea serviciilor oferite…; sau (b) să facă referiri compromițătoare la comparații nefundamentate cu activitatea altora”.
  - **Secțiunea 240, Onorarii:** 240.1–240.4 (onorariile contingente sunt permise pentru misiuni care nu sunt de certificare, cu măsuri de protecție). Introducerea explicativă precizează: „Secțiunea 240 — Punctele 5-8 nu au aplicabilitate”. Acestea sunt punctele IFAC despre comisioanele de recomandare, deci ediția în vigoare **nu conține** o interdicție explicită a comisioanelor.
  - **Secțiunea 260 (cadouri) și 290.124 (relații de afaceri):** un acord prin care firma „acționează ca distribuitor sau comerciant al produselor sau serviciilor clientului” poate genera amenințări la independență. Se aplică clienților de audit, nu publicului larg.
- **Data:** ediția 2011, încă singura listată pe ceccar.ro la 28.10.2026.
- **Status:** ✓ pentru codul în vigoare. ⚠ **Formularea cu „remize din onorariu, comisioane” vine din ediția 2007 (Hotărârea 07/80), abrogată din 2011** (vezi Corecturi). Linkul [codetic-standardeinternationale.ro](https://www.codetic-standardeinternationale.ro/) („Cod etic – Standarde internaționale”, legat de pe ceccar.ro) redirecționează către `mentenanta.ceccar.ro`, deci ✗ indisponibil. Nu am putut verifica dacă există o traducere IESBA mai nouă adoptată ca obligatorie (`TODO`).
- **Registrul / tabloul membrilor:**
  - [CECCAR, „Tablou membri”](https://ceccar.ro/ro/?page_id=97): explică structura Tabloului (8 secțiuni) și leagă două instrumente: [„Verificare valabilitate fișă membru CECCAR”](https://ceccar.ro/ro/?page_id=36750) și [„Verificare valabilitate adeverință cursuri CECCAR”](https://ceccar.ro/ro/?page_id=5461). Pe pagină nu e o căutare publică după nume sau localitate.
  - **Status:** ✓ URL-uri. `TODO`: o căutare publică „Găsește un contabil” după oraș nu am găsit pe ceccar.ro. Instrumentul public confirmat e verificarea fișei de membru.

### 3.2 Camera Consultanților Fiscali (CCF)

- **Afirmația:** „Are un Cod etic obligatoriu… Regulile despre publicitate și comisioane: `TODO`” (`profesionisti.md`, §2).
- **Codul etic:** [Codul privind conduita etică și profesională în domeniul consultanței fiscale, 30.07.2007, MO nr. 647 din 21.09.2007 (legislatie.just.ro)](https://legislatie.just.ro/Public/DetaliiDocument/85547), aprobat prin Hotărârea CCF nr. 3/2007.
  - **Art. 12 alin. (10):** „Consultantul fiscal poate să își facă publicitate profesională, cu respectarea următoarelor reguli: a) prezentarea corectă a experienței și a aptitudinilor profesionale; b) evitarea oricăror precizări cu privire la calitatea serviciilor de consultanță fiscală oferite; c) evitarea oricăror afirmații care aduc atingere intereselor profesionale ale altor consultanți fiscali.”
  - **Art. 12 alin. (12):** „Onorariile profesionale trebuie să fie o reflectare corectă a valorii serviciilor profesionale.”
  - **Art. 5 alin. (5) lit. b):** consultanții „nu trebuie să accepte sau să ofere cadouri de orice natură” care le-ar putea influența judecata.
  - **Comisioane de recomandare:** codul **nu conține** o prevedere explicită.
  - **Status:** ✓ text. ⚠ veche (2007). Pagina nu spune dacă e încă în vigoare, iar pe ccfiscali.ro, la [„Legislație internă”](https://www.ccfiscali.ro/category/despre-ccf/legislatie-ccf/legislatie-interna/) (pagina 1 din 3), nu apare un cod mai nou (`TODO`: paginile 2–3).
- **Registrul public:** [CCF, „Registrul membrilor CCF”](https://www.ccfiscali.ro/registrul-membrilor-ccf/toti-membrii-ccf/). Pagina se încarcă, iar căutarea are filtre pentru tip, stare (Activ/Inactivi), drept de practică, sancțiuni, județ, localitate și cuvânt cheie. Coloanele sunt număr/an, nume, județ/localitate, telefon și email, drept de practică. **Status:** ✓.
- **OG 71/2001:** [Ordonanța nr. 71/2001 privind organizarea și exercitarea activității de consultanță fiscală, forma consolidată la 29.09.2025 (ultima modificare prin OUG nr. 49/2025)](https://legislatie.just.ro/Public/DetaliiDocument/30386).
  - **Art. 3 alin. (1):** „Activitatea de consultanță fiscală constă în:” asistență și consultanță fiscală, inclusiv opinii și analize, întocmirea declarațiilor, reprezentare la ANAF, contestații etc.
  - **Art. 8 alin. (6):** activitatea „poate fi desfășurată numai de persoanele înscrise în Registrul”, în secțiunile de persoane active.
  - **Art. 25 alin. (2):** exercitarea fără drept „constituie infracțiune și se pedepsește potrivit legii penale”.
  - **Status:** ✓.

### 3.3 Notari publici (UNNPR)

- **Afirmația:** „Onorariile minime sunt stabilite prin ordin al ministrului justiției. În 2017, după investigația Consiliului Concurenței, UNNPR s-a angajat să elimine restricțiile privind publicitatea individuală și atragerea clienților (Profit.ro, Capital)” (`profesionisti.md`, §2).
- **Legea:** [Legea notarilor publici și a activității notariale nr. 36/1995, republicată în MO nr. 237 din 19.03.2018, consolidată la 06.12.2024 (ultima modificare prin Legea nr. 301/2024)](https://legislatie.just.ro/Public/DetaliiDocument/159087).
  - **Art. 57 alin. (1) lit. d):** Consiliul Uniunii „propune ministrului justiției onorariile minimale pentru actele și procedurile notariale”.
  - **Art. 67 alin. (2):** ministrul, la propunerea Consiliului Uniunii, poate stabili acte pentru care „onorariul se stabilește liber, între notarul public și solicitant”.
  - **Art. 66 alin. (2):** notarul își poate face cunoscute datele profesionale „în condițiile stabilite prin statutul profesiei”.
  - **Art. 74 lit. l):** e abatere disciplinară „folosirea ori acceptarea, în orice mod, direct sau indirect, a mijloacelor neloiale de atragere a clientelei”, așa cum sunt definite în Codul deontologic.
  - **Status:** ✓.
- **Consiliul Concurenței:** [Decizia nr. 64 din 12.12.2017 privind acceptarea angajamentelor UNNPR (PDF, publicat pe 18.09.2018)](https://www.consiliulconcurentei.ro/wp-content/uploads/2018/09/decizie_unnpr_pt_publicare.pdf).
  - **Art. 1:** angajamentele din anexă „sunt obligatorii pentru Uniunea Națională a Notarilor Publici din România”.
  - **Art. 3:** investigația deschisă prin Ordinul nr. 748/07.11.2016 „se închide prin prezenta decizie”.
  - **Art. 4:** monitorizare 12 luni, inclusiv a modificărilor aduse Codului Deontologic prin Hotărârea Consiliului UNNPR nr. 10/21.04.2017.
  - Decizia descrie îngrijorările înlăturate: „stabilirea onorariilor minime, publicitatea individuală, modalitatea de încasare a onorariilor, atragerea clientelei, respectiv racolarea personalului”.
  - Codul deontologic vechi, citat în decizie, interzicea „însărcinarea unui profesionist, chiar și cu titlu gratuit, de a-i procura clienți ori a-i face reclamă” și spunea „Publicitatea individuală este interzisă”. Din decizie nu reiese ce formulare a rămas după modificare.
  - **Status:** ✓ (sursă primară, înlocuiește Profit.ro și Capital). Nu am găsit pe consiliulconcurentei.ro comunicatul de presă separat, dar decizia e documentul de bază.
- **Căutarea publică de notari:** [UNNPR, „Caută notar/birou notarial”](https://uniuneanotarilor.ro/cauta-notar/). Filtre: nume notar, birou notarial, cameră, județ, localitate, limbă străină, plus „notar în apropiere”. **Status:** ✓.

### 3.4 Avocați (UNBR)

- **Afirmația:** „Publicitatea e strict limitată (UNBR, Decizia 125/2024). Sunt interzise onorariile din «aporturi din afacere», conform textului citat pe avocatnet.ro, neverificat în forma curentă” (`profesionisti.md`, §2).
- **Statutul profesiei de avocat**, versiunea actualizată la 13.09.2024 [(PDF pe unbr.ro)](https://unbr.ro/wp-content/uploads/2024/09/sintact-statut-din-2011-al-profesiei-de-avocat_2024-09-13.pdf), legată de pe [unbr.ro/statutul-profesiei-de-avocat](https://unbr.ro/statutul-profesiei-de-avocat/).
  - **Art. 130 alin. (1):** „Este interzis avocatului să își fixeze onorariile în baza unui pact de quota litis.”
  - **Art. 130 alin. (3):** sunt interzise „Onorariile reprezentând dobândirea, sub orice formă, a unor aporturi din afacere”.
  - **Art. 174 alin. (1):** avocatul nu poate „nici să pretindă și nici să accepte din partea unui alt avocat sau din partea vreunui terț” onorariu, comision sau altă compensație pentru recomandarea unui avocat sau trimiterea unui client.
  - **Art. 174 alin. (2):** avocatul „nu poate vărsa nimănui un onorariu, un comision” sau altă compensație pentru că i s-a trimis o cauză.
  - **Art. 243 și art. 243¹** (publicitate, în forma introdusă prin Hotărârea UNBR nr. 195/2021, citată în Decizia 125/2024): publicitatea formelor de exercitare a profesiei e distinctă de publicitatea profesională. Aceasta din urmă „se realizează în exclusivitate de către organele profesiei”.
  - **Status:** ✓.
- **Decizia UNBR:** [Consiliul UNBR, Decizia nr. 125 din 13/14 decembrie 2024 (cu caracter interpretativ), privind pct. 8.2 și 8.3 din Anexa XXXIV la Statut](https://www.unbr.ro/wp-content/uploads/2025/05/01_08_Anexa-08_Decizie-interpretativa-125-2024_publicitate.pdf). Privește **publicitatea online** a formelor de exercitare a profesiei: promovarea în motoarele de căutare doar prin cuvinte cheie generice, fără denumirea formei de organizare, contravine art. 243¹ alin. (2) din Statut și art. 20 alin. (4) din Codul deontologic. **Status:** ✓.
- **Legea:** [Legea nr. 51/1995 pentru organizarea și exercitarea profesiei de avocat, republicată în MO nr. 440 din 24.05.2018, consolidată la 06.07.2026 (ultima modificare prin Legea nr. 118/2026)](https://legislatie.just.ro/Public/DetaliiDocument/126008).
  - **Art. 47 alin. (1):** „Orice comunicare publică sau orice publicitate făcută de un avocat sau de o formă de exercitare a profesiei este permisă” în condițiile legii.
  - **Art. 47 alin. (2):** Statutul „reglementează detaliat normele aplicabile publicității”.
  - **Art. 30 alin. (3):** onorarii peste „tabloul onorariilor minimale”.
  - **Status:** ✓.

---

## 4. Reglementare și platforme

### 4.1 Legea 236/2018 și registrul ASF al intermediarilor

- **Afirmația:** „Distribuția de asigurări cere înregistrare la ASF (Legea 236/2018, [ASF](https://asfromania.ro/en/a/2407/alerte-asigurari))” (`monetizare.md`, §4).
- **Legea:** [Legea nr. 236 din 5 octombrie 2018 privind distribuția de asigurări, MO nr. 853 din 08.10.2018, consolidată la 16.01.2026](https://legislatie.just.ro/Public/DetaliiDocumentAfis/205851).
  - **Art. 8 alin. (1):** „Pentru a putea desfășura activitate de distribuție, intermediarii principali și secundari se înregistrează la A.S.F.”
  - **Art. 3 alin. (1) pct. 9:** distribuția de asigurări include „furnizarea de informații privind unul sau mai multe contracte de asigurare” pe un site web, după criteriile alese de client, și „alcătuirea unui clasament al produselor de asigurare, inclusiv comparații de preț și de produse”, atunci când clientul poate încheia contractul direct sau indirect prin site.
  - **Status:** ✓. **Relevanță pentru noi:** o pagină care compară asigurări și duce la încheierea contractului e distribuție de asigurări, deci cere înregistrare. Asta întărește regula „fără afiliere la asigurări”.
- **Linkul ASF citat în document:** [ASF, „Alerte asigurări”, 08.04.2022](https://asfromania.ro/en/a/2407/alerte-asigurari): „Insurance entities can legally operate in Romania only if they are registered in the A.S.F. public register”. Trimite la art. 12 din Legea 236/2018 (obligații de informare). **Status:** ✓, dar e o alertă din 2022, nu textul legii.
- **Registrele ASF:** [ASF, „Registrul entităților din piața asigurărilor”](https://asfromania.ro/ro/c/54/registrul-entitatilor-din-piata-asigurarilor), cu [Registrul societăților de asigurare și al intermediarilor principali](https://asfromania.ro/ro/a/1741/registrul-societ%C4%83%C8%9Bilor-de-asigurare-%C8%99i-al-intermediarilor-principali) și [Registrul intermediarilor secundari (RIS), după 16.09.2019](https://asfromania.ro/ro/a/1740/registrul-intermediarilor-secundari-%28ris%29-%28dupa-16.09.2019%29). **Status:** ✓ (pagina de index, văzută pe 28.10.2026).

### 4.2 Lista ASF a fondurilor de pensii Pilon III

- **Afirmația:** „recomandările de investiții (de exemplu Pilon III) intră la ASF” (`monetizare.md`, §3). Pilonul III apare și în tabelul „Beneficiu de care nu știai”.
- **Link:** [ASF, registrul entităților din piața pensiilor private](https://data.asfromania.ro/scr/rp)
- **Ce spune:** Pilonul III are 10 fonduri: NN Activ, AZT Moderato, Pensia Mea, BCR Plus, NN Optim, AZT Vivace, Raiffeisen Acumulare, Stabil, Pensia Mea Plus, Esențial. Administratorii sunt 7: NN Asigurări de Viață, Allianz-Țiriac Pensii Private, SAI Raiffeisen Asset Management, Generali SAFPP, BCR Pensii, BT Pensii, Carpathia Pensii. Pagina nu arată ce administrator are ce fond și nici date.
- **Status:** ✓ lista. Câmpurile cu detalii (decizie de autorizare, dată) apar goale la accesul automat.

### 4.3 Comparatorul ANRE

- **Afirmația:** „Comparatorul oficial (de exemplu ANRE pentru energie)” (`monetizare.md`, §3). Ghidul „Cum compari ofertele de energie în 5 minute” e în `profesionisti.md`, §1.
- **Link:** [ANRE, pagina principală](https://www.anre.ro/), cu legăturile „Comparator energie electrică” → [posf.ro/comparator?comparatorType=electric](https://posf.ro/comparator?comparatorType=electric) și „Comparator gaze naturale” → [posf.ro/comparator?comparatorType=gas](https://posf.ro/comparator?comparatorType=gas).
- **Ce spune:** pagina comparatorului se încarcă cu titlul „ANRE - POSF”. Conținutul e generat dinamic și nu a putut fi citit automat.
- **Data:** linkuri văzute pe anre.ro pe 28.10.2026.
- **Status:** ✓ URL-uri oficiale, legate direct de pe anre.ro. Funcționalitatea nu a fost verificată pe pagina comparatorului (`TODO`: verificare manuală).

### 4.4 ANAF: SPV și termenul Declarației Unice

- **Afirmația:** „Calendarul fiscal anual: Declarația Unică pe 25 mai…” și „ANAF SPV” ca destinație a butonului (`monetizare.md`, §2 și §3).
- **Link:** [ANAF, DGRFP Cluj-Napoca, comunicat „25 MAI 2026 - termenul limită pentru depunere a Declarației unice (formular 212)”](https://static.anaf.ro/static/3/Cluj/20260522102135_25_%20mai_%202026%20.pdf)
- **Ce spune:** „termenul limită până la care pot depune Declarația unică (formular 212) este 25 mai 2026, care reprezintă și termen limită de plată pentru obligațiile fiscale datorate”. Depunerea electronică se face „prin intermediul serviciului «Spațiul Privat Virtual», accesând website-ul www.anaf.ro, secțiunea «Depunere declarație unică și alte formulare SPV-PF»” sau prin e-guvernare.
- **Data:** fișier publicat pe 22.05.2026 (după numele fișierului). Numărul intern din document poartă data „21.05.2025”, probabil o greșeală de tipar a ANAF.
- **Status:** ✓ (sursă ANAF, structura regională). Nuanță: „impozitele locale pe 31 martie” nu e verificat aici (`TODO`: Codul fiscal art. 462/467 sau o sursă a primăriei).

### 4.5 Legea 141/2025: CASS pe pensii

- **Afirmația:** „CASS 10% pe pensiile peste 3.000 lei… «Mi se reține automat sau trebuie să depun ceva?» (mecanismul reținerii: **de verificat** în Legea 141/2025)” (`profesionisti.md`, §1 și „De confirmat” pct. 2).
- **Link:** [Legea nr. 141 din 25 iulie 2025 privind unele măsuri fiscal-bugetare, MO nr. 699 din 25.07.2025](https://legislatie.just.ro/Public/DetaliiDocument/300022)
- **Ce spune (modificări aduse Codului fiscal, Legea 227/2015):**
  - **Art. II pct. 21:** veniturile din pensii devin venituri pentru care se datorează CASS (art. 155 alin. (1) lit. a²).
  - **Art. II pct. 18:** sunt scutite pensiile până la 3.000 lei lunar inclusiv (art. 154 alin. (1) lit. h²).
  - **Art. II pct. 25:** baza lunară e „pensia minus 3.000 lei” pentru fiecare drept de pensie (art. 157⁶ nou). Contribuția se aplică deci **doar pe partea de peste 3.000 lei**.
  - **Art. II pct. 26:** plătitorii de la art. 153 alin. (1) lit. f³) și f⁷) au obligația de a **calcula și reține la sursă** CASS (art. 168 alin. (1)). Conform pct. 13, lit. f⁷) e Casa Națională de Pensii Publice, prin casele teritoriale și sectoriale.
  - **Art. II pct. 30:** pentru sumele de pensie plătite retroactiv, CASS se reține la plată și se virează până pe 25 ale lunii următoare.
  - Cota CASS (10%) e cea de la art. 156 din Codul fiscal, la care trimite art. II pct. 28. Art. 156 nu face parte din extrasul citit.
  - **Aplicare:** art. VII alin. (3) prevede obligațiile CASS pe pensii pentru veniturile realizate între **1 august 2025 și 31 decembrie 2027**. Art. II pct. 40 introduce art. 220⁸ alin. (4), cu scutire pentru veniturile din pensii realizate de la 1 ianuarie 2028.
- **Data:** text inițial din 25.07.2025. Pagina e lungă și am citit doar prima jumătate, deci modificările ulterioare ale legii nu au fost verificate.
- **Status:** ✓ pentru mecanism. **Răspunsul la întrebarea din card: CASS se reține automat de casa de pensii, nu depui nimic.** ⚠ Măsura e temporară (aug. 2025 – dec. 2027), iar documentul nu menționează asta. `TODO`: forma consolidată curentă și cota din art. 156.

### 4.6 WhatsApp Business Platform

- **Afirmația:** „Meta taxează mesajele de business pe categorii. Prețul pentru România e `TODO`… Mesajele trimise din proprie inițiativă trebuie să folosească șabloane aprobate. De verificat.” În §6, „Cost WhatsApp per abonat pe lună (4 rezumate): `TODO`”.
- **Prețuri și reguli:** [Meta, „Pricing on the WhatsApp Business Platform”](https://developers.facebook.com/docs/whatsapp/pricing)
  - „Meta charges on a per-message basis.” Modelul per mesaj se aplică de la 1 iulie 2025 și a înlocuit taxarea pe conversație.
  - Se plătesc doar mesajele livrate, trimise de business către utilizator.
  - Categorii de șabloane: Marketing, Utility, Authentication. Fără șablon (doar răspunsuri): Service.
  - **Fereastra de 24 de ore** pornește când utilizatorul scrie sau sună și se resetează la fiecare mesaj nou. „If it is not open, businesses can only send template messages to reach out to users.”
  - **De la 1 octombrie 2026**, mesajele utility trimise în fereastră, gratuite din iulie 2025, devin plătite.
  - Tarifele pe țări sunt pe [whatsappbusiness.com/products/platform-pricing](https://whatsappbusiness.com/products/platform-pricing/), dar se încarcă dinamic și nu au putut fi citite automat.
  - **Status:** ✓ pentru reguli. Tarifele pentru România nu au fost citite din sursa primară.
- **Șabloane:** [Meta, „Message templates”](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates): „Templates must have a status of `APPROVED` before they can be sent in template messages.” „Each template must be categorized as authentication, marketing, or utility.” Revizuirea e automată, la creare și la editare. **Status:** ✓.
- **Prețuri România:** [Profit.ro, 30.09.2026, „Schimbare la WhatsApp: apare plata pentru mesajele de asistență…”](https://profit.ro/romania-conectata/schimbare-la-whatsapp-apare-plata-pentru-mesajele-de-asistenta-pe-whatsapp-business-api-22793043), care citează rate card-ul Meta: de la 1 octombrie 2026 în România, „marketing 0,0712 €, utility 0,0239 €, authentication 0,0239 €, service 0,0239 € peste pragul gratuit”, cu „1.000 de mesaje de service gratuite pe lună” per număr. **Status:** ⚠ sursă secundară. `TODO`: confirmare în rate card-ul CSV sau PDF de la [developers.facebook.com/docs/whatsapp/pricing#rate-cards](https://developers.facebook.com/docs/whatsapp/pricing#rate-cards).
- **Calcul pentru §6 (pe baza sursei secundare):** rezumatul săptămânal pleacă în afara ferestrei de 24 de ore, deci are nevoie de șablon. La 4 mesaje pe lună: **≈ 0,10 €/abonat** dacă șablonul e acceptat ca *utility* sau **≈ 0,28 €/abonat** dacă Meta îl încadrează la *marketing*. Încadrarea o face Meta la revizuire. Un rezumat de tip „ai 2 noutăți, deschide aplicația” riscă să fie considerat marketing. Conversia în lei cere cursul BNR (`TODO`).

### 4.7 ANPC (influenceri) și CNA (conținut sponsorizat)

- **Afirmația:** „ANPC a găsit în 2026 că mulți influenceri nu marchează reclamele ([Digi24](…))” (`monetizare.md`, §7).
- **Sursa citată:** [Digi24, 02.07.2026 (actualizat 03.07.2026), „Activitatea influencerilor verificată de ANPC…”](https://www.digi24.ro/stiri/sci-tech/lumea-digitala/activitatea-influencerilor-verificata-de-anpc-publicitatea-nu-era-marcata-constant-70-au-creat-continut-cu-ai-fara-a-informa-3844799)
  - ANPC a verificat **10 influenceri** români, toți cu conținut comercial. La unii, postările sponsorizate nu erau marcate constant, iar marcajul era greu de observat. **70%** dintre cei care au folosit materiale create sau modificate cu AI nu au spus asta publicului.
  - Acțiunea a făcut parte dintr-un **sweep internațional ICPEN** (23 martie – 8 aprilie 2026), cu peste 20 de autorități. La nivel global, din 228 de influenceri verificați, 92% aveau conținut comercial și doar circa unul din cinci îl marca corect.
  - Articolul nu trimite la un comunicat ANPC.
  - **Status:** ⚠ sursă secundară.
- **Comunicatul ANPC:** am căutat în [ANPC, „Comunicate de presă”](https://anpc.ro/category/comunicate-de-presa/). Prima pagină (25 din 325) nu conține comunicatul despre influenceri. **Status:** `TODO`.
- **Confirmare independentă a sweep-ului:** autoritatea din Letonia, [PTAC, „CRPC: influencers do not consistently disclose commercial content and AI-generated content”](https://www.ptac.gov.lv/en/article/crpc-influencers-do-not-consistently-disclose-commercial-content-and-ai-generated-content), confirmă ICPEN și perioada 23 martie – 8 aprilie 2026. **Status:** apărut doar în căutare, pagina nu a fost deschisă, deci nu e folosit ca sursă.
- **Context mai vechi (primar):** [ANPC, acțiunea din 2023 de verificare a conturilor de Instagram ale influencerilor](https://anpc.ro/en/the-national-authority-for-consumer-protection-started-in-2023-an-action-to-verify-the-Instagram-accounts-of-Romanians-with-influencer-status-in-the-online-environment/): ANPC a cerut marcarea clară a postărilor sponsorizate. **Status:** apărut doar în căutare, pagina nu a fost deschisă (`TODO`).
- **CNA:** [CNA, comunicat de presă din 02.09.2026, „Decizia CNA nr. 116/2026 a fost publicată în Monitorul Oficial – ce se schimbă și ce nu se schimbă în mediul online”](https://www.cna.ro/a-comunicat-de-presa-decizia-cna-nr-1162026-a-fost-publicata-in-monitorul-oficial-ce-se-schimba-si-ce-nu-se-schimba-in-mediul-online-uymghr17p67ul6wl9iuxjc6h/)
  - Decizia 116/2026 a apărut în MO nr. 718 din 28.08.2026 și a intrat în vigoare pe **27.09.2026**.
  - Canalele de pe YouTube, TikTok, Facebook etc. trebuie să notifice CNA în 60 de zile dacă îndeplinesc cumulativ cinci condiții (art. 36): accesibile publicului din România, țintite spre public român, **≥ 100.000 de urmăritori** (cumulat pe platforme), **≥ 24 de materiale** în ultimele 12 luni și venituri sau beneficii din activitate.
  - Regulile de conținut, **inclusiv comunicările comerciale**, rămân cele din Legea 504/2002 și din Decizia CNA nr. 573/2025 (Codul de reglementare a conținutului audiovizual).
  - **Status:** ✓. Textul exact despre marcarea conținutului sponsorizat din Decizia 573/2025 nu a fost citit (`TODO`).

### 4.8 2Performant și Profitshare

- **Afirmația:** „Singurul program telecom găsit e Orange pe 2Performant, cu 3% din vânzările din magazinul online, adică telefoane. Informația e din 2015 (wall-street.ro)” și „N-am găsit niciun program de afiliere pentru furnizorii de energie sau gaz” (`monetizare.md`, §4).
- **Catalogul public:** [2Performant, „Affiliate Programs”](https://2performant.com/affiliate-programs/)
  - Categorii: Adult, Automotive, Babies Kids & Toys, Beauty, Books, Electronics, Fashion, Food, Games, Gifts & Flowers, Health, Home & Garden, Insurance, Jewelry, Office supplies, Online Mall, Others, Pet supplies, Pharma, Software, Sports & outdoors, Telecom, Watches.
  - **Nu există o categorie de energie, utilități sau bănci.**
  - [Telecom](https://2performant.com/affiliate-programs/telecom/): singurul program afișat e reincarcareprepay.ro; **Orange nu apare**.
  - [Insurance](https://2performant.com/affiliate-programs/insurance/): pint.ro, ottobroker.ro, pet.eurolife-asigurari.ro.
  - Pagina programului Orange, legată ca logo de pe [2performant.com/advertisers](https://www.2performant.com/advertisers/) (`ro.2performant.com/affiliate-programs/telecom/orange-ro/`), întoarce **404**.
  - **Data:** văzut pe 28.10.2026.
  - **Status:** ✓ (sursă primară).
- **Profitshare:** [Business Forum, 12.08.2025, „2Performant drops Profitshare deal”](https://www.businessforum.ro/industry/20250812/2performant-drops-profitshare-deal-2182)
  - Contractul de preluare a Profitshare (semnat pe 6 mai 2025, aprobat de AGEA pe 10 iunie 2025) „has been automatically terminated” pe **6 august 2025**. Motivul: „new circumstances” care au afectat premisele economice. Sursa e un raport al 2Performant la BVB.
  - Articolul [Mobilissimo, 07.05.2025](https://www.mobilissimo.ro/stiri-diverse/2performant-finalizeaza-achizitia-profitshare-emag-isi-ajusteaza-strategia-digitala) („2Performant a finalizat… preluând Profitshare”) e **depășit**.
  - **Status:** ⚠ sursă secundară. **Concluzie: preluarea nu s-a făcut, iar Profitshare rămâne la eMAG.** `TODO`: raportul curent original pe bvb.ro.

### 4.9 MoneySavingExpert

- **Afirmația:** „MoneySavingExpert (UK) include ofertele de top la fel și când nu are link afiliat pentru ele ([MSE](https://www.moneysavingexpert.com/cheap-mobile-finder/contracts/google/))” (`monetizare.md`, §4).
- **Linkuri încercate:** linkul din document, `moneysavingexpert.com/site/editorial-code/` și `moneysavingexpert.com/site/how-this-site-is-financed/`.
- **Status:** ✗ toate întorc **403 Forbidden** la accesul automat. Afirmația rămâne **nesusținută de o sursă verificată** (`TODO`: deschidere manuală în browser a codului editorial MSE).

### 4.10 Consumer Reports

- **Afirmația:** nu apare în documentele actuale. Cerută ca precedent pentru modelul fără reclame.
- **Link:** [Consumer Reports, comunicat de presă din 10.02.2026 (2026 Best Kitchen Brands)](https://www.consumerreports.org/media-room/press-releases/2026/02/consumer-reports-reveals-2026-best-kitchen-brands-for-cooktops-dishwashers-ranges-refrigerators-and-wall-ovens/): „We accept no advertising and pay for all the products we test.” și „CR does not accept advertising, sponsorships, or free product samples from manufacturers.” „CR is independent and nonprofit.” **Status:** ✓.
- [Consumer Reports, „What we do”](https://www.consumerreports.org/about-us/what-we-do/): „independent, nonprofit member organization”, fondată în 1936. Pagina **nu dă numărul de membri**. **Status:** ✓ pentru statut. Numărul de membri e `TODO`.

### 4.11 Platformele de beneficii flexibile

- **Afirmația:** „platformele de beneficii flexibile (Edenred Benefit, Pluxee, Up MultiBeneficii)” (`monetizare.md`, §7).
- **Edenred Benefit:** [benefit.edenred.ro](https://benefit.edenred.ro), legată de pe [edenred.ro](https://www.edenred.ro/): „ecosistemul beneficiilor extrasalariale care susține starea de bine a angajaților”. **Status:** ✓ (link găsit pe edenred.ro; benefit.edenred.ro nu a fost deschis direct).
- **Pluxee:** [MyBenefits by Pluxee](https://www.pluxee.ro/produse/mybenefits-beneficii-flexibile/), legată de pe [pluxee.ro](https://www.pluxee.ro/): „Platforma oferă angajaților tăi experiențe personalizate. Tu îți alegi bugetul, ei își aleg beneficiile.” Pe același site e știrea [„Pluxee achiziționează MyBenefits”](https://www.pluxee.ro/blog/pluxee-achizitioneaza-mybenefits/) (acord din iulie 2025, conform presei). **Status:** ✓ (link găsit pe pluxee.ro; pagina produsului nu a fost deschisă direct).
- **Up MultiBeneficii:** [upromania.ro/companii/up-multibeneficii/](https://upromania.ro/companii/up-multibeneficii/), în meniul „Companii → Motivare și recompensare” de pe [upromania.ro](https://www.upromania.ro/). **Status:** ✓ URL. Pagina produsului nu a fost citită.
- **Notă:** nu am verificat dacă un abonament la o aplicație poate fi inclus ca beneficiu pe aceste platforme și nici tratamentul fiscal (`TODO`).

### 4.12 Prețurile API Anthropic

- **Afirmația:** „Cost onboarding cu LLM per instalare: Haiku 5.5 ≈ 0,02 lei; Sonnet 5.5 ≈ 0,45 lei; prețuri API Anthropic, oct 2026; 1 USD ≈ 4,5 lei” (`monetizare.md`, §6).
- **Link:** [Claude, Pricing](https://claude.com/pricing). Adresa anthropic.com/pricing redirecționează aici.
- **Ce spune (USD per milion de tokeni, input / output):** **Sonnet 5.5: $2 / $10**. **Haiku 5.5: $0,10 / $0,50** până la 100K tokeni, $0,50 / $2,50 peste 100K. Opus 5.5: $4 / $20. Batch: −50%.
- **Data:** văzut pe 28.10.2026.
- **Status:** ✓ prețuri. Raportul Sonnet/Haiku e de 20×, compatibil cu 0,45 / 0,02 lei (22×). **Documentul nu spune câți tokeni presupune un onboarding**, deci cifrele nu se pot reface. Exemplu care dă cifrele din document: 25.000 de tokeni input și 5.000 output. Cursul de 4,5 lei/USD nu e verificat la BNR (`TODO`).

---

## Corecturi pentru documente

*Doar listate. Documentele nu au fost modificate.*

| # | Document, secțiune | Ce scrie acum | Ce ar trebui să scrie | Sursa |
|---|---|---|---|---|
| 1 | `monetizare.md` §1 și „De confirmat” | „Biziday (15 lei/lună după organizator; prețul real e `TODO`)” | „Biziday e gratuit. Nu are abonament, doar donații voluntare cu sume alese de cititor (de la 10 lei o dată; sumele lunare propuse încep de la 20 lei), fără beneficii în schimb.” Argumentul „facem mai mult, deci costăm mai mult” trebuie reformulat: comparăm un produs plătit cu unul gratuit. | App Store RO, biziday.ro/sustine |
| 2 | `monetizare.md` §1 | „cam cât Spotify (26 lei, [Newsweek RO](…))” | Aceeași cifră, cu sursa oficială: „Spotify Premium Individual: 26 RON/lună ([spotify.com/ro-ro/premium](https://www.spotify.com/ro-ro/premium/), oct. 2026)” | Spotify |
| 3 | `monetizare.md` §1 | „55% dintre anulări au loc în ziua 0 (RevenueCat)” | „La trialurile de 3 zile, 55% din anulări au loc în ziua 0. La trialurile de 30 de zile, ca luna noastră gratuită, procentul e 31%.” Concluzia (prima zi contează) rămâne valabilă, dar cu cifra potrivită. | RevenueCat SOSA 2026 |
| 4 | `monetizare.md` §6 | „datele RevenueCat arată 25–45% de la probă la plată, dar pentru piețe cu putere de cumpărare mai mare” | „Mediana trial→plată: 42,5% pentru trialurile de 17–32 de zile; pe regiuni, 29,7% în Europa de Vest și ≈ 20–23% în «restul lumii», unde intră și România (RevenueCat 2026).” | RevenueCat SOSA 2026 |
| 5 | `monetizare.md` §1 | „Un paywall strict convertește de ~5 ori mai bine…” | De adăugat: „(mediana 10,7% față de 2,1% download→plată la ziua 35), cu variație mult mai mare între aplicații” | RevenueCat SOSA 2026 |
| 6 | `monetizare.md` §1 | „românii plătesc greu pentru aplicații ([Statista](…))” | Înlocuit cu Eurostat 2025: „doar 2,8% dintre românii care folosesc internetul plătesc un abonament la «alte aplicații» (UE: 7,0%), iar 10,1% plătesc pentru muzică în streaming (UE: 23,0%).” Statista e din 2020, cu cifra ascunsă. | Eurostat isoc_ec_ibgs |
| 7 | `profesionisti.md` §2, rândul CECCAR | „Sunt interzise ofertele care acordă «remize din onorariu, comisioane…». Text preluat dintr-o reproducere a codului, ediția nu e clară” | „Codul etic național în vigoare (ediția a V-a, obligatorie din 1 ian. 2011) cere ca promovarea să nu exagereze calitatea serviciilor și să nu facă comparații nefundamentate cu alții (Secț. 250). Formularea cu «remize din onorariu, comisioane» era în ediția 2007, abrogată. Ediția 2011 nu interzice explicit comisioanele de recomandare: punctele IFAC 240.5–8 sunt declarate neaplicabile.” Concluzia „nu cerem comision” rămâne prudentă, dar motivul trebuie corectat. Linkurile contabilul.manager.ro și avocatnet se înlocuiesc cu PDF-ul de pe ceccar.ro. | ceccar.ro |
| 8 | `profesionisti.md` §2, rândul CCF | „Regulile despre publicitate și comisioane: `TODO`”, cu sursă fiscalitatea.ro | „Codul etic CCF (2007, art. 12 alin. 10) permite publicitatea dacă e corectă, fără precizări despre calitatea serviciilor și fără atingeri aduse colegilor. Nu conține reguli explicite despre comisioane; art. 5 alin. 5 lit. b interzice cadourile care influențează. Exercitarea consultanței fiscale fără înscriere e infracțiune (OG 71/2001, art. 25 alin. 2).” | legislatie.just.ro 85547 și 30386 |
| 9 | `profesionisti.md` §2, rândul notari | sursele Profit.ro și Capital; „Onorariile minime sunt stabilite prin ordin al ministrului justiției” | Sursa primară: Decizia Consiliului Concurenței nr. 64/12.12.2017 (investigația închisă cu angajamente obligatorii). Formulare mai exactă: „Consiliul UNNPR propune ministrului justiției onorariile minimale (Legea 36/1995, art. 57 alin. 1 lit. d), iar ministrul poate stabili acte cu onorariu liber (art. 67 alin. 2). Atragerea clientelei prin mijloace neloiale e abatere disciplinară (art. 74 lit. l).” | legislatie.just.ro 159087; consiliulconcurentei.ro |
| 10 | `profesionisti.md` §2, rândul avocați | „aporturi din afacere… conform textului citat pe avocatnet.ro, neverificat în forma curentă” | „Statutul profesiei (versiunea din 13.09.2024): art. 130 interzice quota litis și onorariile din «aporturi din afacere»; art. 174 interzice avocatului să plătească sau să primească comision pentru trimiterea de clienți. Decizia UNBR 125/2024 privește publicitatea online (cuvinte cheie în motoarele de căutare).” Art. 174 confirmă direct că un model cu comision per client nu e posibil cu avocații. | unbr.ro |
| 11 | `profesionisti.md` „De confirmat” pct. 1 | „Linkurile oficiale la registrele publice: CECCAR, CCF, UNNPR (`TODO`)” | CCF: ccfiscali.ro/registrul-membrilor-ccf/toti-membrii-ccf/ (căutare după județ și localitate). UNNPR: uniuneanotarilor.ro/cauta-notar/. CECCAR: doar verificarea fișei de membru (ceccar.ro/ro/?page_id=36750); căutarea după oraș rămâne `TODO`. Consecință pentru butonul „Găsește un contabil”: pentru CECCAR nu există, deocamdată, un registru public căutabil confirmat. | site-urile oficiale |
| 12 | `monetizare.md` §4 | sursa ASF pentru Legea 236/2018 e o alertă din 2022 | Citat direct textul legii: art. 8 alin. (1) (înregistrare la ASF) și art. 3 alin. (1) pct. 9 (site-urile care compară asigurări fac distribuție). | legislatie.just.ro 205851 |

| 13 | `profesionisti.md` §1, actul 3, și „De confirmat” pct. 2 | „mecanismul reținerii: **de verificat** în Legea 141/2025” | „CASS de 10% se aplică pe partea de pensie care depășește 3.000 lei și **se reține automat de casa de pensii** (Legea 141/2025, art. II pct. 25–26). Măsura se aplică veniturilor din aug. 2025 – dec. 2027 (art. VII alin. 3).” Ghidul trebuie să spună că pensionarul nu depune nimic pentru pensie. | legislatie.just.ro 300022 |
| 14 | `monetizare.md` §2 și §6 | „Prețul pentru România e `TODO`… șabloane aprobate. De verificat.” Costul WhatsApp per abonat e `TODO`. | „Mesajele inițiate de noi după 24 h cer șablon aprobat de Meta (marketing, utility sau authentication). Din 1 oct. 2026, în România: 0,0712 € marketing și 0,0239 € utility per mesaj livrat (rate card Meta, preluat de Profit.ro). La 4 rezumate pe lună: ≈ 0,10–0,28 € per abonat, după cum Meta încadrează șablonul.” | Meta developers; Profit.ro (⚠) |
| 15 | `monetizare.md` §2 | „Calendarul fiscal anual: Declarația Unică pe 25 mai” | Corect pentru 2026 (formular 212). De adăugat că 25 mai e și termenul de plată, iar depunerea se face prin SPV sau e-guvernare. | ANAF DGRFP Cluj |

| 16 | `monetizare.md` §4 | „Singurul program telecom găsit e Orange pe 2Performant, cu 3%… Informația e din 2015” | „În catalogul public 2Performant (oct. 2026), Orange nu mai apare: pagina programului dă 404, iar categoria Telecom are doar reincarcareprepay.ro. Nu există categorie de energie sau bănci. Există în schimb programe de asigurări (de ex. un broker), pe care oricum le excludem.” Concluzia „nu punem afiliere în pitch” se întărește. | 2performant.com |
| 17 | `monetizare.md` §4 | precedentul MoneySavingExpert, cu link spre o pagină de produs MSE | Nesusținut deocamdată: site-ul MSE refuză accesul automat (403). De citat codul editorial MSE după o verificare manuală sau de scos exemplul. | — |
| 18 | `monetizare.md` §7 | „ANPC a găsit în 2026 că mulți influenceri nu marchează reclamele (Digi24)” | „În sweep-ul internațional ICPEN (23 mar. – 8 apr. 2026), ANPC a verificat 10 influenceri români: marcajul reclamelor nu era constant, iar 70% dintre cei care foloseau AI nu o spuneau.” Sursă secundară până găsim comunicatul ANPC. De adăugat că, din 27.09.2026, creatorii cu peste 100.000 de urmăritori și venituri notifică CNA (Decizia 116/2026), iar comunicările comerciale intră sub Legea 504/2002. | Digi24 (⚠); cna.ro |
| 19 | `monetizare.md` §6 | „Haiku 5.5 ≈ 0,02 lei; Sonnet 5.5 ≈ 0,45 lei” | De adăugat ipoteza de tokeni (de ex. „≈ 25k tokeni input + 5k output per onboarding”) și prețurile: Haiku 5.5 $0,10/$0,50, Sonnet 5.5 $2/$10 per milion de tokeni (claude.com/pricing, oct. 2026). Cursul de 4,5 lei/USD trebuie confirmat la BNR. | claude.com/pricing |

---

## Rămase `TODO`

| Subiect | Ce am încercat | Rezultat |
|---|---|---|
| Revolut România, prețuri | 6 URL-uri revolut.com și help.revolut.com | 403 la toate; de verificat manual în browser |
| Netflix România | help.netflix.com/ro/node/24926 | Prețuri în euro, dar pagina nu confirmă țara |
| Biziday pe Google Play | play.google.com/…ro.biziday | Pagina nu s-a putut citi automat |
| CECCAR, căutare publică după nume sau oraș | ceccar.ro „Tablou membri”, căutări web | Există doar verificarea fișei de membru; Tabloul se publică anual în MO |
| CECCAR, cod etic mai nou (traducere IESBA) | codetic-standardeinternationale.ro | Redirecționează către pagina de mentenanță |
| CCF, cod etic mai nou decât 2007 | ccfiscali.ro „Legislație internă”, pagina 1 din 3 | Neconfirmat |
| ANRE, funcționarea comparatorului | posf.ro/comparator | Pagina e dinamică; doar titlul „ANRE - POSF” a fost citit |
| Impozitele locale, termenul de 31 martie | — | Neverificat; de căutat în Codul fiscal sau pe site-ul unei primării |
| Legea 141/2025, forma consolidată și cota din art. 156 | legislatie.just.ro 300022, prima jumătate | De citit restul textului și forma consolidată |
| WhatsApp, tarifele România din sursa primară | whatsappbusiness.com (dinamic), developers.facebook.com | Rate card-ul CSV sau PDF nu a fost deschis; cifrele vin din Profit.ro (⚠) |
| Comunicatul ANPC despre influenceri (2026) | anpc.ro „Comunicate de presă”, pagina 1 | Negăsit pe prima pagină |
| CNA, textul despre marcarea conținutului sponsorizat (Decizia 573/2025) | — | Neverificat |
| 2Performant, raportul curent BVB despre Profitshare | căutări web | Găsit doar prin presă (Business Forum) |
| MoneySavingExpert, politica de linkuri afiliate | 3 URL-uri moneysavingexpert.com | 403 |
| Consumer Reports, numărul de membri | consumerreports.org „What we do”, comunicatul din feb. 2026 | Nu e menționat |
| Platformele de beneficii: abonamente la aplicații și tratamentul fiscal | — | Neverificat |
| Cursul USD/RON (BNR) | — | Neverificat |
