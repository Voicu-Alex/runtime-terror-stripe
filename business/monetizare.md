# Monetizare: planul recomandat

*Chris, 28 octombrie 2026, versiunea 2. Propunere de aliniat cu Haggy (#4, modelul de business). Se bazează pe feedback-ul organizatorului (#8), pe `docs/product.md`, `docs/design-research.md`, pe analiza de competitori a lui Voicu (`research/competitori.md`, branch `voicu`) și pe research web. Ce nu are sursă e marcat `TODO` sau „ipoteză”.*

## Pe scurt

Produsul trebuie să fie folosit de cât mai mulți români, gratuit. Banii vin din două surse care se susțin una pe alta:

1. **Afiliere neutră (venitul principal, din utilizatorii gratuiți).** Când o lege îți schimbă banii, cardul îți arată cea mai bună variantă pentru tine și te duce direct acolo cu un click. Dacă furnizorul acelei variante are program de afiliere, primim un comision. **Clasamentul se calculează înainte să ne uităm la comisioane.** Dacă cea mai bună variantă nu ne plătește nimic, o arătăm la fel, pe primul loc, cu link neplătit.
2. **Abonament Plus, același pentru toată lumea: 49,99 lei/lună sau 299 lei/an (≈ 25 lei/lună).** Gratuit primești estimarea. Cu Plus primești **calculul exact pe cifrele tale**: pierderi și câștigi pe 12 luni, simulare, documente analizate cu AI, întrebări către asistent.
3. **Fără specialiști ca sursă de venit.** Cele mai multe situații le rezolvi singur, cu pașii din card. Când chiar ai nevoie de un contabil, te trimitem gratuit la registrul public al profesiei.
4. **Fără reclame și fără vânzare de date.** Nimeni nu poate plăti ca să apară primul.
5. **Stripe nu e necesar în produsul de bază.** Abonamentul se plătește prin App Store sau Google Play.

## 1. Afilierea neutră

### Ideea

Nu facem parteneriate în care o firmă ne plătește ca să-i aducem clienți. Facem afiliere **cu toți furnizorii care au program**, iar comisionul vine doar dacă omul alege varianta care chiar e cea mai bună pentru el.

Precedentul: **MoneySavingExpert** (UK) marchează linkurile afiliate cu asterisc și scrie public că, dacă pentru cea mai bună ofertă nu se poate obține un link afiliat, oferta e inclusă exact la fel, doar cu link neplătit ([MSE, nota despre linkuri](https://www.moneysavingexpert.com/cheap-mobile-finder/contracts/google/)). Linia editorială e protejată printr-un cod editorial obligatoriu juridic ([anunțul achiziției MSE](https://www.investegate.co.uk/announcement/rns/moneysupermarket-com-group--mony/acquisition-of-moneysavingexpert-com/3165113)).

### Regulile de neutralitate (le punem în cod și le spunem public)

1. **Clasamentul nu vede comisionul.** Modulul care ordonează variantele primește doar profilul tău și ofertele. Câmpul cu comisionul nu există în datele lui. Comisionul se atașează abia la link, după ce ordinea e stabilită.
2. **Cea mai bună variantă e mereu prima**, cu sau fără afiliere.
3. **Linkul plătit e marcat:** „* Putem primi un comision dacă alegi oferta asta. Ordinea nu depinde de comision.”
4. **„Nu face nimic” e un răspuns valid.** Exemplu: plafonarea la gaz e prelungită până la 31 martie 2027, deci nu ai de schimbat furnizorul. Cardul spune asta, chiar dacă nu câștigăm nimic.
5. **Raport public de transparență, o dată pe an:** cât din venit vine din afiliere și în câte cazuri cea mai bună variantă nu ne-a plătit nimic.
6. **Volumul se negociază, ordinea nu.** Putem spune unui furnizor „ți-am adus 2.000 de clienți luna trecută, vrem un comision mai mare”. Comisionul mai mare nu schimbă niciodată ordinea (regula 1).

### Cum ne apucăm fără contracte directe

Există rețele de afiliere care fac legătura cu firmele: te înscrii o dată, apoi folosești linkurile programelor din rețea fără să negociezi cu fiecare firmă în parte. În România cea mai mare e **2Performant**. Profitshare avea ~250 de programe, iar 2Performant a anunțat preluarea ei, dar tranzacția apare ca oprită într-o sursă ulterioară, deci statutul e neclar ([Profit.ro](https://www.profit.ro/povesti-cu-profit/emag-vinde-profitshare-romania-si-bulgaria-proprietarul-devine-actionar-la-2performant-intelegere-dupa-acord-preliminar-22024149)).

- **`TODO` (Haggy, #4):** care furnizori de energie, telecom și bănci au programe active în aceste rețele, cu ce comision. Lista merge în `business/parteneri.json`.
- Unde nu există program, linkul merge direct la ofertă, neplătit.

### Ce afiliem și ce nu

| Categorie | Exemple de acțiuni din carduri | Afiliere? |
|---|---|---|
| Energie și gaz | „Schimbă furnizorul, economisești X lei/lună” | **Da**, pornim cu ea. Comparația o facem pe datele comparatorului ANRE (`TODO`: cum accesăm datele) |
| Telecom | „Abonamentul tău s-a scumpit cu TVA; uite varianta mai ieftină” | **Da** |
| Conturi de economii, depozite | „Banii din cont pierd față de inflație” | **După avizul unui jurist** |
| Asigurări | – | **Nu, deocamdată.** Distribuția de asigurări e reglementată de Legea 236/2018 și cere înregistrare la ASF ([ASF](https://asfromania.ro/en/a/2407/alerte-asigurari)). De confirmat cu un jurist dacă un link afiliat intră aici |
| Credite | – | **Nu, deocamdată.** Intermedierea de credite e reglementată. De confirmat |
| Pilon III, investiții | „Contribui la Pilon III, deduci până la 400 EUR/an” | **Nu.** Trimitem la lista oficială ASF a fondurilor, neplătit. Cel mai mare risc de reglementare și de încredere |

## 2. Abonamentul Plus

### Prețul: 49,99 lei/lună sau 299 lei/an

- **Facem mai mult decât Biziday, deci costăm mai mult.** Biziday (15 lei/lună după organizator, prețul real e `TODO`) îți dă știrea. Noi îți dăm și suma: cât pierzi, cât poți câștiga, ce faci și până când.
- **Anualul e varianta pe care o împingem:** 299 lei/an ≈ 25 lei/lună, cam cât Spotify (26 lei, [Newsweek RO](https://newsweek.ro/timp-liber/care-sunt-cele-mai-bune-surse-de-muzica-online-si-cat-costa-abonamentul-in-romania)). Lunarul de 49,99 lei e plafonul și face anualul să pară o afacere. Legile care te ating vin de câteva ori pe an, deci un lunar ieftin ar însemna „plătesc o lună, anulez”.
- **Intervalul:** minim ≈ 20 lei/lună (249 lei/an), maxim 50 lei/lună. Testăm anualul la 249 față de 299 lei.
- **De ce putem cere atât:** majoritatea oamenilor folosesc gratuit, iar afilierea acoperă costul lor. Plus e pentru cei care vor calculul complet.

### Gratuit și Plus

Principiul: **gratuit afli ce te atinge și ce poți face. Cu Plus afli exact, pe cifrele tale.**

| | Gratuit | Plus |
|---|---|---|
| Profil din etichete (asistent sau formular) | ✓ | ✓ |
| Alertă când o lege îți atinge etichetele + link la articol | ✓ | ✓ |
| Cele 3 niveluri ale cardului (zero / curios / expert) | ✓ | ✓ |
| Suma în lei/lună, **estimată** după etichete și medii | ✓ | ✓ |
| Buton one-click spre cea mai bună variantă | ✓ | ✓ |
| Legi din care **câștigi** și nu știai (de exemplu deducerea Pilon III) | ✓ | ✓ |
| Suma **exactă**, pe cifrele tale (salariu, chirie, facturi) | – | ✓ |
| Analiza documentelor cu AI: contract de muncă, factură, decizie de pensie (#2, Voicu) | – | ✓ |
| „Planul meu”: pierderi și câștiguri pe 12 luni, cu și fără acțiuni | – | ✓ |
| Simulare: „dacă fac asta, cât câștig” | – | ✓ |
| Întrebări libere către asistent („ce înseamnă legea X pentru mine?”) | – | ✓ |
| Remindere înainte de termene, alerte pe proiecte în consultare | – | ✓ |
| Profiluri pentru familie (de exemplu părinții pensionari) | – | ✓ |

**De ce așa:** tot ce consumă tokeni (documente, întrebări libere, calcul exact) e în Plus. Tot ce aduce oameni și clickuri pe afiliere (alerta, estimarea, butonul) e gratuit.

**Probă:** 30 de zile de Plus la instalare, fără card. Perioadele de probă de 17–32 de zile au cea mai bună conversie ([RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)). După probă treci automat pe Gratuit și nu plătești nimic fără să alegi tu.

## 3. Calculul cu LLM și butoanele „du-mă unde rezolv”

Era deja în plan, în bucăți: catalogul are pentru fiecare act o `formula` și `actiuni` cu câmpul `one_click` (#3, Andrei), iar spațiul de documente cu Claude e #2 (Voicu). Propunerea mea e cum le legăm.

**Cine face ce:**

1. **LLM-ul citește legea** (Monitorul Oficial) și propune: etichetele, formula, acțiunile și unde se rezolvă fiecare. Un om verifică, apoi actul intră în catalog. E motorul descris deja în `product.md`.
2. **Suma o calculează codul, nu LLM-ul.** Formula verificată + cifrele tale = același rezultat de fiecare dată, verificabil și ieftin. Merge pe telefon, fără să trimitem profilul nicăieri. Un LLM care calculează direct poate da altă sumă la fiecare rulare, iar o sumă greșită ne costă încrederea.
3. **LLM-ul explică și răspunde.** Traduce suma pe înțeles, pe cele 3 niveluri, și răspunde la întrebări („de ce mă costă asta?”). Citește documentele încărcate (Plus) și extrage cifrele exacte, pe care apoi tot codul le calculează.

**Butoanele de acțiune** (call to action), după tipul problemei:

| Tipul acțiunii | Unde duce butonul | Exemplu |
|---|---|---|
| Schimbi un furnizor | Cea mai bună ofertă (afiliat dacă există, altfel neplătit) | Energie, telecom |
| Depui ceva la stat | Formularul sau pagina oficială (ANAF SPV, ghișeul.ro) | Declarația Unică, CASS |
| Alegi o opțiune | Pagina oficială, cu termenul | Pilon II: cererea la fond |
| Beneficiu de care nu știai | Unde îl ceri | Deducerea Pilon III: ce dai angajatorului |
| Nu ai nimic de făcut | Niciun buton, doar „Nu trebuie să faci nimic până la {data}” | Gazul până la 31 martie 2027 |
| Situație complicată | Registrul public CECCAR, „Găsește un contabil”, neplătit | Dividende față de salariu, peste un anumit prag |

## 4. Specialiștii: link, nu sursă de venit

Cei mai mulți oameni își rezolvă singuri problema dacă au pașii clari. Puțini ar rezerva o sesiune cu un contabil din aplicație, deci nu construim venit pe asta. Detalii în `business/profesionisti.md`:

- Cardul are pașii „rezolvă singur”. Ghidurile pentru situațiile mai grele sunt verificate de un contabil real, plătit de noi per ghid.
- Doar când chiar e nevoie, butonul „Găsește un contabil” duce la registrul public CECCAR. Nu cerem și nu primim bani de la contabili (codul etic CECCAR interzice oricum ofertele cu comisioane, [contabilul.manager.ro](https://contabilul.manager.ro/a/5028/ceccar-cum-are-voie-un-contabil-sa-si-faca-reclama.html)).

## 5. Unit economics (ipoteze, de verificat)

**Venit pe lună = afiliere + abonamente**
- afiliere = utilizatori activi × rată de click pe acțiuni × rată de conversie × comision mediu;
- abonamente = utilizatori × conversie în Plus × preț net.

| Ipoteză | Valoare | Sursă |
|---|---|---|
| Venit net din anual, după comisionul magazinului (15%) | ≈ 254 lei/an ≈ 21 lei/lună | calcul |
| Conversie în Plus | 2% (prețul e mai mare) | ipoteză, `TODO` |
| Rată de click pe butoanele de acțiune | `TODO` | de măsurat în demo / beta |
| Comision mediu pe client (energie, telecom) | `TODO` | rețelele de afiliere (Haggy, #4) |
| Cost onboarding cu LLM per instalare | Haiku 5.5 ≈ 0,02 lei; Sonnet 5.5 ≈ 0,45 lei | prețuri API Anthropic, oct 2026; 1 USD ≈ 4,5 lei |
| Costuri fixe: LLM pe Monitorul Oficial + găzduire + verificator fiscal part-time | ≈ 7.500 lei/lună | ipoteză |

**Exemplu la 100.000 de instalări:** 2.000 de abonați × 254 lei ≈ 508.000 lei/an din abonamente, plus afilierea (`TODO`). Pragul de rentabilitate doar din abonamente e ≈ 360 de abonați anuali. Afilierea e plusul care plătește utilizatorii gratuiți.

**Despre tokeni:** onboarding-ul cu asistentul rulează pentru fiecare instalare. Testăm Haiku 5.5 și Sonnet 5.5 pe ~30 de conversații reale în română și îl alegem pe cel mai ieftin care pune corect etichetele. Analiza documentelor și întrebările libere sunt în Plus, deci tokenii scumpi îi plătesc abonații. Atenție la promisiunea din `product.md`: etichetele rămân pe telefon, dar conversația de onboarding și documentele pleacă la API. Trebuie spus clar în aplicație, iar formularul rămâne alternativa.

## 6. Promovare fără sponsorizări

1. **Un calculator public, gratuit, pentru fiecare lege mare** („Ce înseamnă Legea 2/2026 pentru tine”). Oamenii caută pe Google fiecare schimbare fiscală, deci paginile astea apar exact atunci.
2. **Widget gratuit pentru redacții**, cu atribuire. Câștigăm vizibilitate în presă fără să plătim pe nimeni.
3. **Carduri de rezultat de distribuit:** „Noile reguli mă costă −120 lei/lună. Pe tine?”
4. **„Dă o lună de Plus, primești o lună”** între utilizatori reali.
5. **Beneficii prin angajator** (Edenred Benefit, Pluxee, Up MultiBeneficii): angajatorul plătește Plus, fără acces la date.
6. **Fără postări plătite la influenceri.** Dacă un creator folosește aplicația, își arată propriul profil și propria sumă. ANPC a găsit în 2026 că mulți influenceri nu marchează reclamele ([Digi24](https://www.digi24.ro/stiri/sci-tech/lumea-digitala/activitatea-influencerilor-verificata-de-anpc-publicitatea-nu-era-marcata-constant-70-au-creat-continut-cu-ai-fara-a-informa-3844799)).

## 7. Slide „Cum facem bani”

> **Gratuit pentru toți. Plătit de cei care vor calculul exact și de firmele alese pe merit.**
> - Gratuit: fiecare lege care te atinge, cât te costă și butonul care te duce unde rezolvi.
> - Afiliere neutră: dacă cea mai bună variantă pentru tine are program de afiliere, primim comision. Ordinea nu se cumpără.
> - Plus, 299 lei/an: suma exactă pe cifrele tale, documente analizate cu AI, planul pe 12 luni.
> - Fără reclame, fără vânzare de date.

## De confirmat

- Prețul real Biziday.
- Programele de afiliere active pentru energie, telecom și bănci, cu comisioane (Haggy).
- Cu un jurist: afilierea pentru conturi bancare, asigurări și credite; ce înseamnă „ordinea nu depinde de comision” ca obligație legală (protecția consumatorului).
- Cum obținem datele de ofertă pentru comparații (comparatorul ANRE și ofertele telecom).
