# Colaborarea cu profesioniști: contabili, consultanți fiscali, notari

*Chris, 28 octombrie 2026, versiunea 3 (surse verificate în `business/bibliografie.md`). Issue #5. Feedback-ul organizatorului: „Colaborare cu contabili, notari etc. pentru coaching: CUM să gestionezi aceste situații.” Modelul de business complet e în `business/model-de-business.md`.*

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
| 3 | CASS 10% pe pensiile peste 3.000 lei | **Da**, de obicei | Consultant fiscal, doar dacă pensionarul are și alte venituri | „Mi se reține automat sau trebuie să depun ceva?” Răspuns: CASS se aplică doar pe partea care depășește 3.000 lei și **se reține automat de casa de pensii**, pentru veniturile din aug. 2025 – dec. 2027 ([Legea 141/2025](https://legislatie.just.ro/Public/DetaliiDocument/300022), art. II pct. 25–26, art. VII alin. 3). Pentru pensie nu depui nimic | „CASS pe pensie: cum citești cuponul” |
| 4 | Dividende 10% → 16% (1 ian 2026) | **Parțial:** ghidul compară variantele | Contabil sau consultant fiscal, pentru sume mari | „Mai merită să-mi iau banii din SRL ca dividende sau pe salariu?” | „Ai SRL și dividende în 2026: 3 variante comparate” |
| 5 | Micro: cotă 1%, plafon 100.000 EUR (1 ian 2026) | **Parțial:** urmărești plafonul | Contabil (oricum îl ai, dacă ai SRL) | „Ce se întâmplă dacă depășesc plafonul la jumătatea anului?” | „Micro în 2026: ce urmărești lunar” |
| 6 | Pilon II cu plată eșalonată (Legea 2/2026, din 5 ian 2027) | **Da:** alegi opțiunea și depui cererea la fond | Consultant fiscal pentru impozitare. Notar dacă moștenești Pilonul II al cuiva | „Iau 30% odată sau totul eșalonat?” Moștenitor: „Cum recuperez Pilonul II al părintelui?” | „Pilonul II la pensie: ce alegi și până când” |
| 7 | Plafonarea la gaz prelungită (OUG 12/2026, până la 31 mar 2027) | **Nu ai nimic de făcut** până la 31 mar 2027 | Niciunul | „Trebuie să fac ceva?” | Nu e nevoie |

Pentru `data/catalog.json`, câmpul `profesionist` poate fi `null`, `"contabil"`, `"consultant_fiscal"` sau `"notar"`. Când e diferit de `null`, cardul arată butonul „Găsește un {profesionist}”, care duce la registrul public. Valori propuse: `dividende-2026` și `micro-2026` → `"contabil"`; `pilon2-2027` → `"consultant_fiscal"`; restul → `null`.

**Notă despre consultanții de pensii:** nu am găsit o profesie reglementată de „consultant independent de pensii”. Agenții autorizați de ASF lucrează de regulă pentru un fond, adică vând. Nu-i includem. **De confirmat.**

## 2. Ce are voie fiecare profesie

| Profesia | Organismul | Ce am găsit | Ce înseamnă pentru noi |
|---|---|---|---|
| Expert contabil / contabil autorizat | CECCAR | Codul etic în vigoare e ediția a V-a, obligatorie din 1 ian. 2011 ([PDF pe ceccar.ro](https://ceccar.ro/ro/wp-content/uploads/2011/09/Codul_etic_2011.pdf)). Secțiunea 250 cere ca promovarea să nu exagereze calitatea serviciilor și să nu facă comparații nefundamentate. Interdicția explicită a „comisioanelor, remizelor din onorariu” era în ediția 2007, abrogată. Ediția 2011 nu interzice explicit comisioanele de recomandare | Nu cerem comision, din prudență și din principiu (neutralitate). Să plătim noi un contabil ca să scrie un ghid e o colaborare obișnuită |
| Consultant fiscal | Camera Consultanților Fiscali ([OG 71/2001](https://legislatie.just.ro/Public/DetaliiDocument/30386)) | [Codul de conduită etică din 2007](https://legislatie.just.ro/Public/DetaliiDocument/85547), art. 12 alin. 10: publicitatea e permisă dacă e corectă, fără precizări despre calitatea serviciilor și fără atingeri aduse colegilor. Nu are reguli explicite despre comisioane. Art. 5 alin. 5 lit. b interzice cadourile care influențează. Consultanța fiscală fără înscriere e infracțiune (OG 71/2001, art. 25 alin. 2) | Tratăm la fel ca la CECCAR. Atenție și pentru noi: „ce poți face” nu trebuie să devină consultanță fiscală |
| Notar public | UNNPR ([Legea 36/1995](https://legislatie.just.ro/Public/DetaliiDocument/159087)) | Consiliul UNNPR propune ministrului justiției onorariile minimale (art. 57 alin. 1 lit. d). Ministrul poate stabili acte cu onorariu liber (art. 67 alin. 2). Atragerea clientelei prin mijloace neloiale e abatere disciplinară (art. 74 lit. l). Investigația Consiliului Concurenței s-a închis cu angajamente obligatorii pentru UNNPR ([Decizia nr. 64/12.12.2017](https://www.consiliulconcurentei.ro/wp-content/uploads/2018/09/decizie_unnpr_pt_publicare.pdf)) | Doar link la [căutarea publică de notari](https://uniuneanotarilor.ro/cauta-notar/), neplătit |
| Avocat | UNBR ([Legea 51/1995](https://legislatie.just.ro/Public/DetaliiDocument/126008), Statutul profesiei) | [Statutul, versiunea din 13.09.2024](https://unbr.ro/wp-content/uploads/2024/09/sintact-statut-din-2011-al-profesiei-de-avocat_2024-09-13.pdf): **art. 174 interzice plata sau primirea de comision pentru trimiterea de clienți**, iar art. 130 interzice quota litis și onorariile din „aporturi din afacere”. Publicitatea online e limitată ([Decizia UNBR 125/2024](https://www.unbr.ro/wp-content/uploads/2025/05/01_08_Anexa-08_Decizie-interpretativa-125-2024_publicitate.pdf)) | **Nu intră în MVP.** Niciunul din cele 7 acte nu cere avocat, iar comisionul e interzis explicit |

**Variantele pe care le-am cântărit:**

| Varianta | Riscul deontologic | Câți ar folosi-o | Alegem? |
|---|---|---|---|
| Comision de la profesionist per client | Mare (la avocați interzis explicit, art. 174) | Puțini | **Nu** |
| Sesiuni plătite prin aplicație, cu taxă de serviciu | Mic sau mediu, de confirmat | Puțini; majoritatea rezolvă singuri | **Nu** în MVP. Poate mai târziu, dacă utilizatorii o cer |
| **Ghiduri semnate de profesioniști + link gratuit la registrul public** | Mic | Toți cei care deschid cardul | **Da** |

## 3. Fluxul utilizatorului (pentru ecranele lui Andrei)

1. **Cardul** (de exemplu „Dividende 16%”) arată pașii „Ce poți face”, fiecare cu butonul lui (vezi `business/model-de-business.md`, secțiunea 3).
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

1. **Registrele publice:**
   - **CCF:** [registrul membrilor](https://www.ccfiscali.ro/registrul-membrilor-ccf/toti-membrii-ccf/), cu căutare după județ și localitate ✓.
   - **UNNPR:** [caută notar](https://uniuneanotarilor.ro/cauta-notar/) ✓.
   - **CECCAR:** există doar [verificarea fișei de membru](https://ceccar.ro/ro/?page_id=36750). Pagina [„Tablou membri”](https://ceccar.ro/ro/?page_id=97), folosită acum în `lib/continut.ts`, explică Tabloul, dar nu are căutare după oraș. `TODO`: unde trimitem butonul „Găsește un contabil”.
2. Un cod etic CECCAR mai nou (traducerea IESBA) și un cod CCF mai nou decât 2007: neconfirmate.
