# Colaborarea cu profesioniști: contabili, consultanți fiscali, notari

*Chris, 28 octombrie 2026, versiunea 2. Issue #5. Feedback-ul organizatorului: „Colaborare cu contabili, notari etc. pentru coaching: CUM să gestionezi aceste situații.” Monetizarea completă e în `business/monetizare.md`.*

## Recomandarea pe scurt

- **Mai întâi „rezolvă singur”.** Majoritatea schimbărilor se rezolvă cu pașii din card: un formular, o cerere, o schimbare de furnizor sau nimic. Așa răspundem la „CUM să gestionezi”.
- **Profesioniștii ne ajută să scriem pașii, nu să vindem sesiuni.** Ghidurile pentru situațiile mai grele sunt verificate și semnate de un contabil real, plătit de noi per ghid.
- **Când chiar ai nevoie de un specialist:** butonul „Găsește un contabil” duce la registrul public al profesiei. Nu primim bani de la profesioniști și nu le vindem clienți.
- **De ce nu facem venit din sesiuni:** puțini oameni ar rezerva o sesiune din aplicație, iar regulile profesiilor fac comisioanele riscante (secțiunea 2).

## 1. Ce profesionist pentru fiecare act din demo

| # | Actul | Rezolvi singur? | Profesionist, doar dacă e nevoie | Întrebarea tipică | Ghid |
|---|---|---|---|---|---|
| 1 | Plafonarea la energia electrică eliminată (1 iul 2025) | **Da:** compari ofertele și schimbi furnizorul | Niciunul | „Ce ofertă aleg ca să plătesc mai puțin?” | „Cum compari ofertele de energie în 5 minute” |
| 2 | TVA 21% / cote reduse 11% (Legea 141/2025) | Persoană fizică: **nu ai ce face**. PFA plătitor de TVA: **parțial** | Contabil, pentru PFA sau SRL plătitor de TVA | „Ce cotă pun pe facturile emise după 1 august? Ce fac cu contractele în curs?” | „TVA 2025 pentru PFA: ce verifici pe facturi” |
| 3 | CASS 10% pe pensiile peste 3.000 lei | **Da**, de obicei | Consultant fiscal, doar dacă pensionarul are și alte venituri | „Mi se reține automat sau trebuie să depun ceva?” (mecanismul reținerii: **de verificat** în Legea 141/2025) | „CASS pe pensie: cum citești cuponul” |
| 4 | Dividende 10% → 16% (1 ian 2026) | **Parțial:** ghidul compară variantele | Contabil sau consultant fiscal, pentru sume mari | „Mai merită să-mi iau banii din SRL ca dividende sau pe salariu?” | „Ai SRL și dividende în 2026: 3 variante comparate” |
| 5 | Micro: cotă 1%, plafon 100.000 EUR (1 ian 2026) | **Parțial:** urmărești plafonul | Contabil (oricum îl ai, dacă ai SRL) | „Ce se întâmplă dacă depășesc plafonul la jumătatea anului?” | „Micro în 2026: ce urmărești lunar” |
| 6 | Pilon II cu plată eșalonată (Legea 2/2026, din 5 ian 2027) | **Da:** alegi opțiunea și depui cererea la fond | Consultant fiscal pentru impozitare. Notar dacă moștenești Pilonul II al cuiva | „Iau 30% odată sau totul eșalonat?” Moștenitor: „Cum recuperez Pilonul II al părintelui?” | „Pilonul II la pensie: ce alegi și până când” |
| 7 | Plafonarea la gaz prelungită (OUG 12/2026, până la 31 mar 2027) | **Nu ai nimic de făcut** până la 31 mar 2027 | Niciunul | „Trebuie să fac ceva?” | Nu e nevoie |

Pentru `data/catalog.json`, câmpul `profesionist` poate fi `null`, `"contabil"`, `"consultant_fiscal"` sau `"notar"`. Când e diferit de `null`, cardul arată butonul „Găsește un {profesionist}”, care duce la registrul public. Valori propuse: `dividende-2026` și `micro-2026` → `"contabil"`; `pilon2-2027` → `"consultant_fiscal"`; restul → `null`.

**Notă despre consultanții de pensii:** nu am găsit o profesie reglementată de „consultant independent de pensii”. Agenții autorizați de ASF lucrează de regulă pentru un fond, adică vând. Nu-i includem. **De confirmat.**

## 2. Ce are voie fiecare profesie

| Profesia | Organismul | Ce am găsit | Ce înseamnă pentru noi |
|---|---|---|---|
| Expert contabil / contabil autorizat | CECCAR | Publicitatea e permisă doar membrilor activi care practică independent. Sunt interzise ofertele care acordă „remize din onorariu, comisioane, tarife reduse sau alte avantaje”, precum și publicitatea comparativă. Text preluat dintr-o reproducere a codului, ediția nu e clară ([contabilul.manager.ro](https://contabilul.manager.ro/a/5028/ceccar-cum-are-voie-un-contabil-sa-si-faca-reclama.html), [codul etic, avocatnet](https://www.avocatnet.ro/articol_9226/Codul-etic-national-al-profesionistilor-contabili.html)) | Comisionul per client plătit nouă e riscant. **Nu-l cerem.** Să plătim noi un contabil ca să scrie un ghid e o colaborare obișnuită |
| Consultant fiscal | Camera Consultanților Fiscali (OG 71/2001) | Are un Cod etic obligatoriu, iar Camera sancționează încălcările ([fiscalitatea.ro](https://www.fiscalitatea.ro/normele-procedurale-privind-monitorizarea-si-controlul-activitatii-consultantilor-fiscali-2829/)). **Regulile despre publicitate și comisioane: `TODO`** | Tratăm la fel ca la CECCAR |
| Notar public | UNNPR (Legea 36/1995) | Onorariile minime sunt stabilite prin ordin al ministrului justiției. În 2017, după investigația Consiliului Concurenței, UNNPR s-a angajat să elimine restricțiile privind publicitatea individuală și atragerea clienților ([Profit.ro](https://profit.ro/taxe-si-consultanta/consiliul-concurentei-uniunea-notarilor-publici-si-a-asumat-angajamentele-in-vederea-liberalizarii-onorariilor-17504817), [Capital](https://www.capital.ro/consiliul-concurentei-a-finalizat-investigatia.html)) | Doar link la căutarea publică de notari, neplătit |
| Avocat | UNBR (Legea 51/1995, Statutul profesiei) | Publicitatea e strict limitată ([UNBR, Decizia 125/2024](https://www.unbr.ro/wp-content/uploads/2025/05/01_08_Anexa-08_Decizie-interpretativa-125-2024_publicitate.pdf)). Sunt interzise onorariile din „aporturi din afacere”, conform textului citat pe [avocatnet.ro](https://www.avocatnet.ro/forum/discutie_20503/Pactul-de-quota-litis.html), neverificat în forma curentă | **Nu intră în MVP.** Niciunul din cele 7 acte nu cere avocat |

**Variantele pe care le-am cântărit:**

| Varianta | Riscul deontologic | Câți ar folosi-o | Alegem? |
|---|---|---|---|
| Comision de la profesionist per client | Mare | Puțini | **Nu** |
| Sesiuni plătite prin aplicație, cu taxă de serviciu | Mic sau mediu, de confirmat | Puțini; majoritatea rezolvă singuri | **Nu** în MVP. Poate mai târziu, dacă utilizatorii o cer |
| **Ghiduri semnate de profesioniști + link gratuit la registrul public** | Mic | Toți cei care deschid cardul | **Da** |

## 3. Fluxul utilizatorului (pentru ecranele lui Andrei)

1. **Cardul** (de exemplu „Dividende 16%”) arată pașii „Ce poți face”, fiecare cu butonul lui (vezi `business/monetizare.md`, secțiunea 3).
2. Dacă actul are ghid, apare **„Cum gestionezi situația · 3 minute”**, cu semnătura: „Verificat de [nume], expert contabil CECCAR nr. …, la [dată]”.
3. Dacă actul are `profesionist` diferit de `null`, la finalul pașilor apare **„Situația ta e mai complicată?”** cu butonul **„Găsește un {profesionist}”**.
4. Butonul deschide un modal scurt (`content/modal-specialist.md`):
   - când ai nevoie de un specialist și când nu;
   - ce să-l întrebi: întrebarea tipică din tabelul de mai sus, pe care o poți copia;
   - ce să ai pregătit (de exemplu ultima declarație, suma dividendelor).
5. **„Deschide registrul”** te duce la registrul public al profesiei, în afara aplicației. Nu trimitem nimic din profilul tău.

## 4. Coaching: ghidurile „Cum gestionezi”

Organizatorul a zis „CUM să gestionezi”. Cea mai bună formă de coaching se poate refolosi: **ghiduri scurte, semnate de un profesionist real**.

- **Format:** 5–7 pași, maximum 3 minute de citit, pe cele 3 niveluri ale Iasminei (zero / curios / expert). Tonul urmează regulile de voce ale lui Matei.
- **Semnătura:** „Verificat de [nume], expert contabil CECCAR nr. …, la [dată]”. Se potrivește cu „verificat la <dată>” de pe carduri.
- **Plata:** noi plătim profesionistul o sumă fixă per ghid (`TODO`, preț de aflat), plus o revizuire când se schimbă legea. Banii merg de la noi la el, nu invers.
- **Primele ghiduri:** dividende 2026 (actul 4), micro 2026 (actul 5), Pilonul II la pensie (actul 6), TVA pentru PFA (actul 2).

## 5. Contactul cu profesioniști reali

Mesajul e în `business/mesaj-contabili.md`. Îl trimite Chris, pe LinkedIn sau pe email, la 3–5 contabili sau consultanți fiscali.

| Cui | Canal | Data | Răspuns | Preț per ghid | Citat pentru pitch (cu acord) |
|---|---|---|---|---|---|
| `TODO` | | | | | |
| `TODO` | | | | | |
| `TODO` | | | | | |

## De confirmat

1. Linkurile oficiale la registrele publice: CECCAR, Camera Consultanților Fiscali, UNNPR (`TODO`: URL-urile exacte).
2. Mecanismul reținerii CASS pe pensii, în textul Legii 141/2025.
3. Regulile curente CCF și UNBR despre publicitate și comisioane.
