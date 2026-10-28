# Modelul de business: „Ce înseamnă pentru mine”

*Versiunea unificată, 28 octombrie 2026 (Chris, #5, peste modelul lui Haggy, #4). Înlocuiește versiunea anterioară a acestui fișier (commit `fb77a46`) și `business/monetizare.md`. Fiecare cifră are sursa în `business/bibliografie.md` sau e marcată `TODO`. Punctele marcate **[decizie de echipă]** ating reguli din `CLAUDE.md`.*

## Pe scurt

1. **Banii vin din abonamente.** O singură variantă pentru toată lumea, cu **prima lună gratuită**: **299 lei/an (≈ 25 lei/lună) sau 49,99 lei/lună**. Dacă testul de preț arată rezistență, coborâm la limita de jos a intervalului: **19 lei/lună sau 190 lei/an**.
2. **Fără plan gratuit permanent.** Dacă echipa îl vrea totuși, acesta dă doar știrile care te privesc, fără sumă și fără calcul.
3. **Notificări în aplicație și un rezumat pe WhatsApp**, pentru cine îl vrea.
4. **Afilierea nu e o sursă de venit în pitch.** Aplicația arată întâi comparatorul oficial ANRE, apoi furnizorii în ordine alfabetică. Eticheta „partener” apare doar unde există program de afiliere. În 2Performant nu există, în octombrie 2026, nicio categorie de energie sau bănci.
5. **Specialiștii nu sunt o sursă de venit.** Butonul trimite gratuit la registrul public al profesiei, iar aplicația spune „Nu primim bani de la specialiști” (`business/profesionisti.md`).
6. **Fără reclame și fără vânzare de date.** Înainte de orice apel la LLM ascundem numele și datele de identificare.

## 1. Abonamentul

### Biziday nu e un reper de preț

Organizatorul a sugerat „Biziday, 15 lei”. **Biziday e gratuit.** Nu are abonament și nici achiziții în aplicație ([App Store RO](https://apps.apple.com/ro/app/biziday/id1164239111?l=ro)). Se susține din donații voluntare: 10–250 lei o dată sau 20–500 lei pe lună, fără beneficii în schimb ([biziday.ro/sustine](https://www.biziday.ro/sustine/)).

Ce ne spune asta: **există oameni care dau de bunăvoie 20 lei pe lună pentru știri esențiale fără să primească nimic.** Noi le dăm în plus suma în lei, termenul și butonul care îi duce unde rezolvă.

### Prețul și intervalul

| | Preț | Pe lună | Din salariul mediu net (5.688 lei, [INS, aug 2026](https://insse.ro/cms/sites/default/files/com_presa/com_pdf/cs08r26.pdf)) |
|---|---|---|---|
| **Anual (varianta principală)** | 299 lei/an | ≈ 25 lei | 0,44% |
| Lunar (plafonul) | 49,99 lei/lună | 49,99 lei | 0,88% |
| Limita de jos, dacă testul arată rezistență | 190 lei/an sau 19 lei/lună | ≈ 16–19 lei | ≈ 0,3% |

- **Anualul e varianta implicită.** Legile mari care te ating vin de câteva ori pe an. Fără anual, mulți ar plăti o lună când apare o lege și ar anula. Lunarul de 49,99 lei face anualul să pară o afacere.
- **Reper:** 299 lei/an ≈ 25 lei/lună, cam cât Spotify Premium Individual (26 lei/lună, [spotify.com/ro-ro/premium](https://www.spotify.com/ro-ro/premium/)).
- **Riscul, spus cinstit:** doar **2,8%** dintre românii care folosesc internetul plătesc un abonament la „alte aplicații” (media UE: 7,0%), iar 10,1% plătesc pentru muzică (UE: 23,0%) ([Eurostat, isoc_ec_ibgs, 2025](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/isoc_ec_ibgs?format=JSON&lang=en&geo=RO&geo=EU27_2020&time=2025&ind_type=IND_TOTAL)). De aceea limita de jos (19 lei) rămâne pe masă până la testul de preț.
- **Alte repere:** abonamentul AvocatNet (în versiunea anterioară: 390 lei + TVA / 6 luni) e `TODO`, pentru că pagina nu se mai încarcă.

### De ce aplicație plătită, cu o lună gratuită

Date din [RevenueCat, State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps):
- **Lungimea probei:** cele de 17–32 de zile au cea mai bună conversie, cu mediana de 42,5% de la probă la plată. Pe regiuni, conversia e de 29,7% în Europa de Vest și de **≈ 20–23% în „restul lumii”**, unde intră și România.
- **Paywall strict sau freemium:** un paywall strict convertește de ~5 ori mai bine la ziua 35 (mediana de 10,7% față de 2,1% de la descărcare la plată). Variația între aplicații e însă mare.
- **Anulările din prima zi:** la probele de 30 de zile, **31%** dintre anulări au loc în ziua 0 (55% e cifra pentru probele de 3 zile). Prima zi trebuie deci să arate valoarea. La onboarding arătăm schimbările din 2025–2026 care te-au atins deja, cu suma.

**Fără card la pornirea probei.** Aproximativ un sfert dintre români evită plățile online de teama furtului de date (`docs/design-research.md`). La final întrebăm o dată și nu taxăm pe nimeni care n-a ales să plătească.

### Ce primești

| | Abonament (și în luna gratuită) | Plan gratuit, doar dacă echipa îl vrea |
|---|---|---|
| Profil din etichete (asistent, formular sau documente), inclusiv domeniul de lucru | ✓ | ✓ |
| Știrile care te privesc + link la articolul din lege | ✓ | ✓ |
| Legi cu efect indirect, marcate „informativ” | ✓ | ✓ |
| Suma în lei/lună pentru tine (cât pierzi, cât câștigi) | ✓ | – |
| „Ce poți face” cu termen și butonul care te duce unde rezolvi | ✓ | – |
| „Planul meu”: 12 luni, cu și fără acțiuni, plus simulare | ✓ | – |
| Analiza documentelor cu AI (contract, factură, cupon de pensie) | ✓ | – |
| Remindere înainte de termene, alerte pe proiecte în consultare | ✓ | – |
| Rezumat pe WhatsApp | ✓ | – |

## 2. Notificările: destule ca să merite abonamentul

1. **Legile care te ating direct**, cu sumă. Acestea primesc notificare push.
2. **Legile cu efect indirect**, prin prețuri, chirie sau angajator. Apar în flux, marcate „informativ”.
3. **Domeniul tău de lucru** (IT, construcții, HoReCa…). Partea financiară e deja în aplicație. Schimbările nefinanciare (de exemplu un sistem nou la ANAF) sunt amânate în `CLAUDE.md`. Propunerea e să intre ca știri fără sumă. **[decizie de echipă]**
4. **Calendarul fiscal anual.** Exemplu: Declarația Unică (formularul 212) se depune și se plătește până pe 25 mai 2026, prin SPV sau e-guvernare ([ANAF, DGRFP Cluj](https://static.anaf.ro/static/3/Cluj/20260522102135_25_%20mai_%202026%20.pdf)). Acest termen primește notificare push.
5. **Proiectele în consultare publică**, ca avertizare din timp.

### Rezumatul pe WhatsApp

- **Doar cu acord explicit.** Numărul de telefon ajunge pe serverul nostru, deci promisiunea „profilul rămâne pe telefon” se nuanțează pentru cine alege WhatsApp.
- **Mesajul nu conține sume sau date personale.** Exemplu: „Ai 2 noutăți, una cu termen pe 25 mai. Deschide aplicația.”
- **Mesajele trimise de noi după fereastra de 24 de ore folosesc șabloane aprobate de Meta** ([Meta, Message templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)).
- **Cost:** din 1 octombrie 2026, în România, 0,0712 € per mesaj de marketing și 0,0239 € per mesaj utilitar ([Profit.ro](https://profit.ro/romania-conectata/schimbare-la-whatsapp-apare-plata-pentru-mesajele-de-asistenta-pe-whatsapp-business-api-22793043), sursă secundară; tabelul oficial de prețuri: [Meta, rate cards](https://developers.facebook.com/docs/whatsapp/pricing#rate-cards), `TODO`). La 4 rezumate pe lună: **≈ 0,10–0,28 € per abonat**.

## 3. Calculul și butoanele „du-mă unde rezolv”

1. **LLM-ul citește legea** și propune etichetele, formula și acțiunile. Un om verifică, apoi actul intră în catalog.
2. **Suma o calculează codul** (`lib/formule.ts`), nu LLM-ul. Aceeași formulă și aceleași cifre dau același rezultat de fiecare dată, și totul poate fi verificat.
3. **LLM-ul explică, răspunde la întrebări și citește documentele.** Cifrele extrase din documente le calculează tot codul.

**„Ce poți face” e personalizat pe profil:** îți arătăm care dintre acțiunile prevăzute de lege ți se aplică ție, cu suma și termenul tău. Nu recomandăm produse (`CLAUDE.md`). Atenție la o limită: consultanța fiscală fără înscriere la Camera Consultanților Fiscali e infracțiune ([OG 71/2001, art. 25 alin. 2](https://legislatie.just.ro/Public/DetaliiDocument/30386)). Granița dintre informație și consultanță e de confirmat cu un jurist.

| Tipul acțiunii | Unde duce butonul | Exemplu |
|---|---|---|
| Depui ceva la stat | Pagina oficială (ANAF SPV, ghișeul.ro) | Declarația Unică |
| Alegi o opțiune prevăzută de lege | Pagina oficială, cu termenul | Pilon II: cererea la fond |
| Beneficiu de care nu știai | Unde îl ceri | Deducerea Pilon III |
| Schimbi furnizorul | Comparatorul ANRE ([energie](https://posf.ro/comparator?comparatorType=electric), [gaz](https://posf.ro/comparator?comparatorType=gas)), apoi furnizorii în ordine alfabetică | Energie |
| Nu ai nimic de făcut | „Nu trebuie să faci nimic până la {data}” | Gazul, până la 31 martie 2027 |
| Situație complicată | Registrul public al profesiei, neplătit | Dividende față de salariu |

## 4. Afilierea și furnizorii

**Ce face aplicația acum** (`lib/continut.ts`, `business/parteneri.json`): pentru energie și gaz arată întâi comparatorul oficial, apoi furnizorii **în ordine alfabetică**, nu după preț sau comision. Eticheta „partener” apare doar unde există program de afiliere.

**Ce am găsit în 2Performant (octombrie 2026):**
- **Lipsesc categoriile de energie și bănci** ([2Performant, Affiliate Programs](https://2performant.com/affiliate-programs/)).
- **Orange nu mai apare.** Pagina programului dă 404, iar categoria [Telecom](https://2performant.com/affiliate-programs/telecom/) are doar reincarcareprepay.ro.
- **Preluarea Profitshare de către 2Performant a fost anulată** în august 2025 ([Business Forum](https://www.businessforum.ro/industry/20250812/2performant-drops-profitshare-deal-2182)).

**Concluzia:** nu punem venit din afiliere în pitch.

**Ce excludem de la afiliere, și de ce:**
- **Asigurări:** după Legea 236/2018, site-urile care compară asigurări fac distribuție de asigurări (art. 3 alin. 1 pct. 9) și trebuie înregistrate la ASF (art. 8 alin. 1) ([legislatie.just.ro](https://legislatie.just.ro/Public/DetaliiDocumentAfis/205851)). Afilierea la brokeri precum Pint.ro intră aici.
- **Pilon III și investiții:** trimitem doar la [registrul ASF al pensiilor private](https://data.asfromania.ro/scr/rp), neplătit.
- **Credite:** sunt reglementate. De confirmat cu un jurist.

**Dacă apar programe pentru energie sau telecom** (**[decizie de echipă]**):
- ordinea rămâne cea de acum, alfabetică, după comparatorul oficial;
- linkul plătit e marcat;
- nu scriem niciodată „cea mai bună ofertă” (`CLAUDE.md`).

## 5. Specialiștii

Rezumat din `business/profesionisti.md`:
- Cele mai multe situații se rezolvă cu pașii din card.
- Când e nevoie de un specialist, butonul duce la registrul public, gratuit.
- **Nu luăm comision de la profesioniști.** La avocați e interzis explicit: Statutul profesiei, art. 174, interzice plata sau primirea de comision pentru trimiterea de clienți ([Statutul, versiunea din 13.09.2024](https://unbr.ro/wp-content/uploads/2024/09/sintact-statut-din-2011-al-profesiei-de-avocat_2024-09-13.pdf)).
- Un marketplace de consultanță plătit prin Stripe Connect ar contrazice textul pe care aplicația îl arată deja: „Nu primim bani de la specialiști”.

## 6. Datele personale

- **Înainte de orice apel la LLM ascundem:** numele, CNP-ul, adresa, IBAN-ul și angajatorul. Ascunderea se face la noi, nu la furnizorul de AI.
- **Sumele (salariu, pensie) rămân date personale după GDPR chiar fără nume.** Spunem cinstit: „trimitem cifrele, fără nume și fără date de identificare, și nu le păstrăm”.
- **Etichetele profilului rămân pe telefon.** Formularul rămâne alternativa pentru cine nu vrea să vorbească cu asistentul.

## 7. Plata

- **App Store și Google Play**, pentru abonamentul din aplicație. Nu trebuie cont separat.
- **Opțional, mai târziu: Stripe Billing**, pentru plata anuală pe web, cu perioadă de probă (`trial_period_days: 30`) și facturi pentru PFA și SRL. Pentru Stripe Connect nu avem nevoie: nu intermediem plăți către specialiști.

## 8. Unit economics (ipoteze)

**Venit pe lună ≈ instalări × rata de pornire a probei × conversia după probă × preț net.**

| Ipoteză | Valoare | Sursă |
|---|---|---|
| Venit net din anual, după comisionul magazinului (15%) | 299 lei → ≈ 254 lei/an; 190 lei → ≈ 162 lei/an | calcul |
| Conversia după luna gratuită | ≈ 20–23% (mediana pentru „restul lumii”) | RevenueCat 2026 |
| Câți pornesc proba din cei care instalează | `TODO` | de măsurat |
| Onboarding cu LLM (≈ 28k tokeni intrare + 4k ieșire, ipoteză) | Haiku 5.5: $0,10 / $0,50 per milion de tokeni → ≈ 0,02 lei; Sonnet 5.5: $2 / $10 → ≈ 0,45 lei (la 4,5 lei/USD, curs `TODO` BNR) | [claude.com/pricing](https://claude.com/pricing) |
| WhatsApp, 4 rezumate pe lună | ≈ 0,10–0,28 € per abonat | secțiunea 2 |
| Costuri fixe: LLM pe Monitorul Oficial + găzduire + verificator fiscal part-time | ≈ 7.500 lei/lună | ipoteză |

**Pragul de rentabilitate pe costurile fixe:** ≈ 360 de abonați anuali la 299 lei (≈ 560 la 190 lei).

## 9. Promovare fără sponsorizări

1. **Un calculator public, gratuit, pentru fiecare lege mare**, ca ușă către luna gratuită.
2. **Widget gratuit pentru redacții**, cu atribuire.
3. **Carduri de rezultat de distribuit:** „Noile reguli mă costă −120 lei/lună. Pe tine?”
4. **„Dă o lună, primești o lună”** între utilizatori reali.
5. **Prin angajator:** platformele de beneficii flexibile [Edenred Benefit](https://benefit.edenred.ro), [Pluxee MyBenefits](https://www.pluxee.ro/produse/mybenefits-beneficii-flexibile/), [Up MultiBeneficii](https://upromania.ro/companii/up-multibeneficii/). Angajatorul plătește abonamentul, fără acces la date. Merge bine cu etichetele de domeniu.
6. **Fără postări plătite la influenceri.** Context:
   - În verificarea internațională ICPEN din 2026, ANPC a constatat că influencerii români nu marchează constant reclamele ([Digi24](https://www.digi24.ro/stiri/sci-tech/lumea-digitala/activitatea-influencerilor-verificata-de-anpc-publicitatea-nu-era-marcata-constant-70-au-creat-continut-cu-ai-fara-a-informa-3844799), sursă secundară).
   - Din 27 septembrie 2026, creatorii cu peste 100.000 de urmăritori notifică CNA ([CNA, Decizia 116/2026](https://www.cna.ro/a-comunicat-de-presa-decizia-cna-nr-1162026-a-fost-publicata-in-monitorul-oficial-ce-se-schimba-si-ce-nu-se-schimba-in-mediul-online-uymghr17p67ul6wl9iuxjc6h/)).

## 10. Răspunsuri scurte pentru juriu

- **„De ce nu întreb ChatGPT?”** Noi venim la tine fără să întrebi. Formula e verificată de un om. Cardul are termenul și butonul care te duce unde rezolvi.
- **„E sfat financiar?”** Arătăm acțiunile prevăzute de lege care ți se aplică ție, cu articolul alături. Nu recomandăm produse.
- **„Cât de des primesc ceva?”** Legile directe, legile indirecte, domeniul tău, calendarul fiscal și proiectele în consultare (secțiunea 2).
- **„De ce n-ați luat comision de la furnizori?”** Pentru energie și bănci nu există programe deschise. La asigurări, comparația e distribuție reglementată de ASF. Și oricum, neutralitatea e produsul nostru.

## De confirmat

- Testul de preț cu 5–10 oameni: hotărăște între 299 lei/an și 190 lei/an.
- Tabelul oficial de prețuri WhatsApp (Meta) și cursul BNR.
- Cu un jurist: granița dintre informație și consultanță fiscală.
- În echipă: planul gratuit (da/nu) și știrile nefinanciare pe domeniu.
