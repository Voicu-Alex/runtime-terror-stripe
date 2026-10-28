# Monetizare: planul recomandat

*Chris, 28 octombrie 2026, versiunea 3. Propunere de aliniat cu Haggy (#4, modelul de business). Se bazează pe feedback-ul organizatorului (#8), pe `docs/produs.md`, `docs/design-research.md`, `CLAUDE.md` și pe research web. Ce nu are sursă e marcat `TODO` sau „ipoteză”. Punctele marcate **[decizie de echipă]** ating reguli din `CLAUDE.md` și se adoptă doar după discuția în echipă.*

## Pe scurt

1. **Banii vin din abonamente.** O singură variantă pentru toată lumea: **49,99 lei/lună sau 299 lei/an (≈ 25 lei/lună)**, cu **prima lună gratuită**.
2. **Aplicația e plătită.** Dacă echipa vrea totuși un plan gratuit, acesta dă doar știrile care te privesc, fără sumă, fără calcul și fără plan.
3. **Notificări în aplicație și un rezumat pe WhatsApp**, pentru cine îl vrea.
4. **Contează și legile cu efect indirect**, nu doar cele care te ating direct. Așa ai motiv să deschizi aplicația și între legile mari.
5. **Afilierea e un bonus, nu un pilon.** N-am găsit programe pentru energie, iar cele mai multe legi schimbă taxe, nu furnizori. **[decizie de echipă]**
6. **Fără reclame și fără vânzare de date.** Înainte de orice apel la LLM ascundem numele și datele de identificare.
7. **Stripe nu e necesar în produsul de bază.** Abonamentul se plătește prin App Store sau Google Play.

## 1. Abonamentul

### Prețul: 49,99 lei/lună sau 299 lei/an, prima lună gratuită

- **Facem mai mult decât Biziday, deci costăm mai mult.** Biziday (15 lei/lună după organizator; prețul real e `TODO`) îți dă știrea. Noi îți dăm și suma: cât pierzi, cât poți câștiga, ce faci și până când.
- **Anualul e varianta pe care o împingem:** 299 lei/an ≈ 25 lei/lună, cam cât Spotify (26 lei, [Newsweek RO](https://newsweek.ro/timp-liber/care-sunt-cele-mai-bune-surse-de-muzica-online-si-cat-costa-abonamentul-in-romania)). Lunarul de 49,99 lei e plafonul și face anualul să pară o afacere. Fără anual, mulți ar plăti o lună când apare o lege mare și ar anula imediat.
- **Intervalul:** minim ≈ 20 lei/lună (249 lei/an), maxim 50 lei/lună. Îl validăm cu testul de preț din `business/README-chris.md`.

### De ce aplicație plătită, cu o lună gratuită

- **Un paywall strict convertește de ~5 ori mai bine la 35 de zile decât freemium** ([RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)).
- **Probele de 17–32 de zile au cea mai bună conversie.** Luna gratuită intră exact în interval.
- **Fără card la pornirea probei.** Aproximativ un sfert dintre români evită plățile online de teama furtului de date (`docs/design-research.md`). La final întrebăm o dată și nu taxăm pe nimeni care n-a ales să plătească.
- **Prima zi trebuie să arate valoarea.** 55% dintre anulări au loc în ziua 0 (RevenueCat). La onboarding arătăm deci schimbările din 2025–2026 care te-au atins deja, cu suma.
- **Riscul:** românii plătesc greu pentru aplicații ([Statista](https://www.statista.com/statistics/1265685/romania-willingness-to-pay-for-mobile-phone-apps)). Mai puțini utilizatori înseamnă și mai puțină recomandare de la om la om. Testul de preț ne spune cât de mare e riscul.

### Ce primești

| | Abonament (după luna gratuită) | Plan gratuit, doar dacă echipa îl vrea |
|---|---|---|
| Profil din etichete (asistent sau formular), inclusiv domeniul de lucru | ✓ | ✓ |
| Știrile care te privesc + link la articolul din lege | ✓ | ✓ |
| Legi cu efect indirect, marcate „informativ” | ✓ | ✓ |
| Suma în lei/lună pentru tine (cât pierzi, cât câștigi) | ✓ | – |
| „Ce poți face” cu termen și butonul care te duce unde rezolvi | ✓ | – |
| „Planul meu”: pierderi și câștiguri pe 12 luni, cu și fără acțiuni | ✓ | – |
| Simulare: „dacă fac asta, cât câștig” | ✓ | – |
| Analiza documentelor cu AI: contract de muncă, factură, decizie de pensie (#2, Voicu) | ✓ | – |
| Întrebări libere către asistent | ✓ | – |
| Remindere înainte de termene, alerte pe proiecte în consultare | ✓ | – |
| Rezumat pe WhatsApp | ✓ | – |
| Profiluri pentru familie (de exemplu părinții pensionari) | ✓ | – |

## 2. Notificările: destule ca să merite abonamentul

O lege mare care te atinge direct vine de câteva ori pe an. Abonamentul se justifică prin tot ce vine între ele:

1. **Legile care te ating direct**, cu sumă. Acestea sunt singurele care primesc notificare push.
2. **Legile cu efect indirect.** O lege care nu-ți schimbă impozitul poate să-ți schimbe prețurile, chiria sau situația angajatorului. Apar în flux cu eticheta „informativ”, care există deja în mockup.
3. **Domeniul tău de lucru** (IT, construcții, HoReCa, transport, agricultură, sănătate, educație). Partea financiară e deja în plan: exemplul IT cu OUG 156/2024 e în mockup. Schimbările nefinanciare pe domeniu, de exemplu un sistem nou la ANAF, sunt amânate în `CLAUDE.md` („efectele nefinanciare vin mai târziu”). Propun să intre ca știri fără sumă. **[decizie de echipă]**
4. **Calendarul fiscal anual:** Declarația Unică pe 25 mai, impozitele locale pe 31 martie. Aceste termene revin în fiecare an.
5. **Proiectele în consultare publică**, ca avertizare din timp.

**Ca să nu devină zgomot:** push doar pentru 1 și 4. Restul merg în flux și în rezumatul săptămânal.

### Rezumatul pe WhatsApp

- **Doar cu acord explicit (opt-in).** Numărul de telefon ajunge pe serverul nostru, deci promisiunea „profilul rămâne pe telefon” se nuanțează pentru cine alege WhatsApp.
- **Mesajul nu conține sume sau date personale.** Exemplu: „Ai 2 noutăți săptămâna asta, una cu termen pe 25 mai. Deschide aplicația.”
- **Cost per mesaj:** Meta taxează mesajele de business pe categorii. Prețul pentru România e `TODO`, de verificat pe pagina oficială WhatsApp Business. Mesajele trimise din proprie inițiativă trebuie să folosească șabloane aprobate. De verificat.

## 3. Calculul și butoanele „du-mă unde rezolv”

Era deja în plan, în bucăți: catalogul are pentru fiecare act o `formula` și `actiuni` cu `one_click` (#3, Andrei), iar spațiul de documente cu Claude e #2 (Voicu).

**Cine face ce:**

1. **LLM-ul citește legea** din Monitorul Oficial și propune etichetele, formula, acțiunile și unde se rezolvă fiecare. Un om verifică, apoi actul intră în catalog.
2. **Suma o calculează codul, nu LLM-ul.** Formula verificată și cifrele tale dau același rezultat de fiecare dată. E verificabil, ieftin și merge pe telefon.
3. **LLM-ul explică și răspunde:** traduce suma pe cele 3 niveluri, răspunde la întrebări și citește documentele. Cifrele extrase din documente le calculează tot codul.

**„Ce poți face” e cât mai acționabil și personalizat pe profilul tău.** Personalizarea înseamnă *care* dintre acțiunile prevăzute de lege ți se aplică ție, cu suma și termenul tău. Asta respectă regula din `CLAUDE.md`: „arătăm impactul și acțiunea posibilă din lege, nu recomandăm produse”. Mai departe de atât, adică recomandări de produse sau „ce ar trebui să faci” dincolo de lege, e **[decizie de echipă]**. Atenție la două limite:
- consultanța fiscală e o activitate reglementată (OG 71/2001, Camera Consultanților Fiscali);
- recomandările de investiții (de exemplu Pilon III) intră la ASF.

Ambele sunt de confirmat cu un jurist.

| Tipul acțiunii | Unde duce butonul | Exemplu |
|---|---|---|
| Depui ceva la stat | Formularul sau pagina oficială (ANAF SPV, ghișeul.ro) | Declarația Unică, CASS |
| Alegi o opțiune prevăzută de lege | Pagina oficială, cu termenul | Pilon II: cererea la fond |
| Beneficiu de care nu știai | Unde îl ceri | Deducerea Pilon III: ce dai angajatorului |
| Schimbi un furnizor | Comparatorul oficial (de exemplu ANRE pentru energie) | Energie |
| Nu ai nimic de făcut | Niciun buton, doar „Nu trebuie să faci nimic până la {data}” | Gazul până la 31 martie 2027 |
| Situație complicată | Registrul public CECCAR, „Găsește un contabil”, neplătit | Dividende față de salariu (`business/profesionisti.md`) |

## 4. Afilierea: bonus, cu reguli **[decizie de echipă]**

Am verificat cele 7 acte din demo: doar unul (plafonarea la energia electrică) are o acțiune de tip „alegi un furnizor”. N-am găsit niciun program de afiliere pentru furnizorii de energie sau gaz. Singurul program telecom găsit e Orange pe 2Performant, cu 3% din vânzările din magazinul online, adică telefoane. Informația e din 2015 ([wall-street.ro](https://www.wall-street.ro/articol/eCommerce/190180/orange-romania-intra-in-2parale.html)). **Concluzia: nu punem sume din afiliere în pitch.**

Dacă echipa vrea totuși afiliere acolo unde există program, regulile ar fi:

1. **Ordinea nu vede comisionul.** Variantele se ordonează după cât economisești, cu calculul vizibil. Comisionul se atașează la link abia după ce ordinea e stabilită.
2. **Varianta cu cea mai mare economie e prima**, cu sau fără afiliere. Precedent: MoneySavingExpert (UK) include ofertele de top la fel și când nu are link afiliat pentru ele ([MSE](https://www.moneysavingexpert.com/cheap-mobile-finder/contracts/google/)).
3. **Linkul plătit e marcat:** „* Putem primi un comision. Ordinea nu depinde de el.”
4. **Fără afiliere la Pilon III, investiții, asigurări și credite.** Distribuția de asigurări cere înregistrare la ASF (Legea 236/2018, [ASF](https://asfromania.ro/en/a/2407/alerte-asigurari)). De confirmat cu un jurist.

Regula din `CLAUDE.md` („fără «cel mai bun produs»”) cere formularea „ordonate după cât economisești”, nu „cea mai bună variantă”.

## 5. Datele personale

- **Înainte de orice apel la LLM, ascundem:** numele, CNP-ul, adresa, IBAN-ul și angajatorul. Ascunderea se face pe telefon sau pe serverul nostru, nu la furnizorul de AI.
- **Sumele (salariu, pensie) rămân date personale după GDPR chiar fără nume**, pentru că datele pseudonimizate sunt tot date personale. Spunem cinstit în aplicație: „trimitem cifrele, fără nume și fără date de identificare, și nu le păstrăm”.
- **Etichetele profilului rămân pe telefon.** Ce pleacă: conversația de onboarding, documentele încărcate (cu datele ascunse) și numărul de telefon, doar pentru cine alege WhatsApp.
- **Formularul rămâne alternativa** pentru cine nu vrea să vorbească cu asistentul.

## 6. Unit economics (ipoteze, de verificat)

**Venit pe lună ≈ utilizatori × conversie după luna gratuită × preț net.**

| Ipoteză | Valoare | Sursă |
|---|---|---|
| Venit net din anual, după comisionul magazinului (15%) | ≈ 254 lei/an ≈ 21 lei/lună | calcul |
| Conversie după luna gratuită | `TODO` (de măsurat; datele RevenueCat arată 25–45% de la probă la plată, dar pentru piețe cu putere de cumpărare mai mare) | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps) |
| Câți încep proba din cei care instalează | `TODO` | de măsurat |
| Cost onboarding cu LLM per instalare | Haiku 5.5 ≈ 0,02 lei; Sonnet 5.5 ≈ 0,45 lei | prețuri API Anthropic, oct 2026; 1 USD ≈ 4,5 lei |
| Cost WhatsApp per abonat pe lună (4 rezumate) | `TODO` | prețurile WhatsApp Business |
| Costuri fixe: LLM pe Monitorul Oficial + găzduire + verificator fiscal part-time | ≈ 7.500 lei/lună | ipoteză |

**Pragul de rentabilitate pe costurile fixe:** ≈ 360 de abonați anuali (7.500 × 12 / 254). Analiza documentelor și întrebările libere consumă tokeni, dar le folosesc doar abonații, deci costul lor e acoperit din abonament.

## 7. Promovare fără sponsorizări

1. **Un calculator public, gratuit, pentru fiecare lege mare** („Ce înseamnă Legea 2/2026 pentru tine”). Oamenii caută pe Google fiecare schimbare fiscală, deci paginile astea apar exact atunci. E și ușa către luna gratuită.
2. **Widget gratuit pentru redacții**, cu atribuire. Câștigăm vizibilitate în presă fără să plătim pe nimeni.
3. **Carduri de rezultat de distribuit:** „Noile reguli mă costă −120 lei/lună. Pe tine?”
4. **„Dă o lună, primești o lună”** între utilizatori reali.
5. **Prin angajator:** platformele de beneficii flexibile (Edenred Benefit, Pluxee, Up MultiBeneficii). Angajatorul plătește abonamentul, fără acces la date. Merge bine cu etichetele de domeniu (IT, construcții…).
6. **Fără postări plătite la influenceri.** ANPC a găsit în 2026 că mulți influenceri nu marchează reclamele ([Digi24](https://www.digi24.ro/stiri/sci-tech/lumea-digitala/activitatea-influencerilor-verificata-de-anpc-publicitatea-nu-era-marcata-constant-70-au-creat-continut-cu-ai-fara-a-informa-3844799)).

## 8. Slide „Cum facem bani”

> **Plătești pentru că afli la timp cât te costă o lege și ce poți face.**
> - Prima lună gratuită, apoi 299 lei/an (≈ 25 lei/lună) sau 49,99 lei/lună.
> - Pentru banii ăștia primești: suma în lei pentru tine, termenele, butonul care te duce unde rezolvi, planul pe 12 luni și rezumatul pe WhatsApp.
> - Fără reclame, fără vânzare de date; numele tău nu ajunge la AI.
> - Distribuție: calculatoare publice per lege, presa și angajatorii.

## Răspunsuri scurte pentru juriu

- **„De ce nu întreb ChatGPT?”** Noi venim la tine fără să întrebi. Formula e verificată de un om. Cardul are termenul și butonul care te duce unde rezolvi.
- **„E sfat financiar?”** Arătăm acțiunile prevăzute de lege care ți se aplică ție, cu articolul alături. Nu recomandăm produse.
- **„Cât de des primesc ceva?”** Legile directe, cele indirecte, domeniul tău, calendarul fiscal și proiectele în consultare (secțiunea 2).

## De confirmat

- Prețul real Biziday.
- Prețurile WhatsApp Business pentru România și regulile pentru șabloane.
- Cu un jurist: limita dintre informație și consultanță fiscală (OG 71/2001) pentru „ce poți face”; afilierea, dacă echipa o vrea.
- În echipă: planul gratuit (da/nu), știrile nefinanciare pe domeniu, afilierea.
