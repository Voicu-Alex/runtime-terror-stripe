# Parcursul utilizatorului: de la zero la expert

**Autor:** Iasmina (conținut și UX) · **Data:** 28 octombrie 2026 · **Branch:** `iasmina`

Feedback de la organizator: „0 knowledge → curiosity → expert.” Plus, indirect: cardurile trebuie să fie scurte, ca știrile de pe Biziday. De aici regula de bază: **fiecare ecran spune un singur lucru, iar cine vrea mai mult apasă.**

Textele pe niveluri pentru cele 7 acte sunt în [`niveluri.json`](niveluri.json). Sursele și ce diferă față de context sunt în [`niveluri-surse.md`](niveluri-surse.md).

Regulile de ton ale lui Matei (`content/voice-rules.md`) nu existau când am scris. Până atunci: propoziții scurte, cifra prima, fără termeni juridici la nivelul Zero, fără linii de pauză, fără glume.

## Cele 3 niveluri, pe scurt

| Nivel | Pentru cine | Ce conține | Unde apare |
|---|---|---|---|
| **Zero** | Omul care nu știe nimic | Maximum 20 de cuvinte. Ce se schimbă pentru el, cu cifra în lei dacă se poate. Fără „cotă”, „bază de calcul”, „ordonanță”. | Pe card, mereu vizibil |
| **Curios** | Cel care apasă „De ce?” | 3–4 propoziții: de ce s-a schimbat, pe cine atinge și pe cine nu, un exemplu cu cifre | Se deschide sub card |
| **Expert** | Cel care vrea textul legii | Actul, articolul, Monitorul Oficial, linkul oficial, 1–2 nuanțe (excepții, plafoane) | Se deschide sub Curios, cu „Textul legii” |

Fiecare nivel îl presupune pe cel de dinainte. Nimeni nu e obligat să treacă mai departe de Zero.

---

## 1. Onboarding: 3 ecrane

Scopul: în 20 de secunde omul știe ce face aplicația, de ce poate avea încredere și cum își face profilul. Fără cont, fără date bancare.

### Ecranul 1: ce face aplicația

> **Legile se schimbă des. Îți spunem doar ce te privește.**
> Fiecare lege nouă, tradusă în lei pe lună pentru tine.

Dedesubt, un card real, la nivelul Zero, ca exemplu:

> *Din ianuarie 2026, din dividendele tale rămâne mai puțin: impozitul a crescut de la 10% la 16%.*

Buton: **Mai departe**. Link mic: **Am deja un profil** (pentru cine a reinstalat aplicația).

### Ecranul 2: ce primești la fiecare schimbare

> **Pentru fiecare lege afli 5 lucruri.**

Cele 5 elemente ale notificării, ca listă cu iconițe:
1. Ce s-a schimbat
2. Cât te costă sau cât câștigi, în lei pe lună
3. Ce poți face
4. Până când
5. Unde scrie, în lege

Sub listă: *Fiecare cifră are sursa lângă ea. Dacă nu am verificat-o, îți spunem.*

Buton: **Mai departe**.

### Ecranul 3: profilul și încrederea

> **Ca să știm ce te privește, avem nevoie de câteva lucruri despre tine.**
> Nu îți cerem banca, nu faci cont. Profilul rămâne pe telefonul tău.

Două butoane, egale ca greutate:
- **Vorbesc cu asistentul** (aprox. 1 minut, 6 întrebări)
- **Completez un formular**

Link mic: **Arată-mi întâi un exemplu** (deschide aplicația cu profilul demo Andrei, ca să vadă fără să răspundă la nimic).

---

## 2. Profilul: asistentul și cele 6 întrebări

Asistentul pune **o întrebare pentru fiecare familie de etichete**, pe limba oricui. Sub fiecare întrebare sunt butoane cu răspunsuri gata făcute (atingi și treci mai departe) și opțiunea de a scrie liber. Fiecare întrebare are **„Sar peste”**.

După fiecare răspuns, asistentul confirmă scurt ce a înțeles, ca etichete pe care le poți scoate cu „×”. Nu ghicește: dacă răspunsul e neclar, întreabă o dată, apoi trece mai departe.

| # | Familia | Întrebarea | Răspunsuri rapide (etichete) |
|---|---|---|---|
| 1 | Cum câștig | **Din ce îți vin banii în fiecare lună?** Poți alege mai multe. | Salariu · PFA · Dividende din SRL · Pensie |
| 2 | Domeniul meu | **În ce domeniu lucrezi?** | IT · Construcții · HoReCa · Transport · Sănătate · Agricultură · Altul |
| 3 | Ce conduc | **Ai o firmă sau un PFA pe numele tău?** | SRL microîntreprindere · PFA · Nu am |
| 4 | Ce dețin | **Ce ai pe numele tău?** Poți alege mai multe. | Apartament sau casă · Mașină · Pilon II · Pilon III · Nu știu ce e Pilonul II |
| 5 | Unde locuiesc | **Unde stai și cu ce te încălzești?** | Chirie · Casa mea · Am ipotecă · Încălzire pe gaz |
| 6 | Cine depinde de mine | **Ai pe cineva în grijă?** | Copii · Părinți · Nu |

Note pentru Andrei (afișare) și pentru cine face asistentul:
- Întrebarea 3 se sare automat dacă la întrebarea 1 nu s-a ales PFA sau Dividende din SRL.
- „Nu știu ce e Pilonul II” nu e o etichetă. Deschide o explicație de două rânduri (de scris când avem sursa ASF), apoi întreabă din nou.
- Dacă omul scrie liber („lucrez în IT, am și un SRL, stau în chirie”), asistentul extrage etichetele doar din lista fixă de mai sus și i le arată pentru confirmare. Nu inventează etichete noi.

**Mesajul de început al asistentului:**
> Îți pun 6 întrebări scurte. Răspunzi cu o atingere sau în cuvintele tale. Poți sări peste oricare.

**Mesajul de final:**
> Gata. Am notat: *salariu, IT, dividende din SRL, chiriaș, încălzire pe gaz, Pilon II.* Le poți schimba oricând din Profil.
> Buton: **Vezi ce te privește**

### Formularul (alternativa)

Aceleași 6 întrebări, pe un singur ecran, ca grupuri de etichete care se bifează. Aceeași ordine, aceleași cuvinte, același „Sar peste”. Butonul de jos devine activ după cel puțin o etichetă aleasă.

---

## 3. Prima zi: ce vede omul imediat

Imediat după profil, fără alt ecran intermediar:

1. **Sus, totalul:** „Schimbările deja în vigoare te costă **X lei pe lună**.” Sub cifră, mic: *Estimare pentru profilul tău. Scenariu educativ, nu consultanță.*
2. **Fluxul:** doar schimbările **deja în vigoare** care îi ating etichetele, fiecare ca un card la nivelul Zero: starea, data, textul Zero, suma pe lună.
3. **Un singur lucru de făcut:** dacă una din schimbări are o acțiune cu termen, ea apare prima, cu „mai sunt N zile”.
4. **Ce urmează:** sub schimbările în vigoare, separat și mai discret, cele adoptate care intră în vigoare mai târziu (de exemplu Pilonul II din 5 ianuarie 2027), cu data.

Ce **nu** apare în prima zi: textul legii, nuanțe, liste lungi, notificări de tip „bine ai venit”.

## 4. Curiozitatea: ce îl face să apese „De ce?”

Butonul **„De ce?”** stă pe fiecare card, lângă cifră. Ce îl face pe om să apese:

- **Cifra îl surprinde.** Textul Zero se termină cu cifra lui, nu cu una generală. O sumă personală ridică întrebarea „de unde vine?”.
- **„Pe cine atinge și pe cine nu.”** Nivelul Curios răspunde mereu la „de ce mie și vecinului nu?”. Asta e întrebarea pe care o pune aproape oricine vede o sumă negativă.
- **Exemplul cu cifre.** Curios are mereu un calcul scurt pe care îl poate verifica singur (de exemplu „la 10.000 lei dividende, impozitul crește de la 1.000 la 1.600 lei”).

### Elementul de progres (fără să devină joc)

În capul fluxului, discret:

> **Ai înțeles 3 din 5 schimbări care te ating.**

- O schimbare contează ca „înțeleasă” când omul a deschis nivelul Curios.
- Fără puncte, insigne, serii de zile sau clasamente. Fără notificări de tipul „nu ai mai intrat de 3 zile”.
- Când ajunge la toate: *Știi tot ce te privește acum. Te anunțăm când apare ceva nou.* Apoi mesajul dispare.
- Progresul e pe dispozitiv, ca profilul.

## 5. Expert: ce primește cine merge până la capăt

Sub Curios, butonul **„Textul legii”** deschide nivelul Expert:

- **Actul și articolul:** de exemplu *Legea 141/2025, art. II pct. 1 (Codul fiscal, art. 43 alin. (2))*.
- **Monitorul Oficial:** numărul și data publicării.
- **Linkul oficial** la legislatie.just.ro (sau ANAF, ANRE, ASF), plus **„verificat la <dată>”**.
- **1–2 nuanțe:** excepții, plafoane, regimuri tranzitorii. Exact lucrurile pe care un om obișnuit nu le găsește singur în text.
- **„Vorbește cu un specialist”:** legătura cu un contabil sau consultant, din task-ul lui Chris (câmpul `profesionist` din catalog). Apare doar la schimbările unde o decizie greșită costă (dividende, micro, Pilon II), nu la toate.
- **„Am găsit o greșeală”:** un link simplu de raportare. Încrederea vine și din faptul că poți corecta.

## 6. Primele zile, după prima

| Când | Ce primește omul | De ce |
|---|---|---|
| Ziua 1 | Fluxul cu schimbările în vigoare, totalul, un lucru de făcut | Valoare imediată, fără efort |
| Când apare o lege nouă care îi atinge etichetele | O notificare cu cele 5 elemente, textul la nivelul Zero | Singurul motiv să-l deranjăm |
| Cu 30 și cu 7 zile înainte de un termen de acțiune | „Mai sunt 7 zile pentru …” | Termenele reale sunt urgența; nu inventăm altele |
| Când o lege adoptată intră în vigoare (de ex. 5 ian 2027, Pilonul II) | „De azi se aplică …” | Trecerea din „urmează” în „în vigoare”. La Pilonul II, textul spune și că regulile noi pornesc abia după ce ASF autorizează primul fond de plată (art. 111) |
| Când se termină o măsură temporară (31 mar 2027 la gaz, 31 dec 2027 la CASS pe pensii) | „Din luna viitoare, …” | Și sfârșitul unei reguli schimbă banii |
| Niciodată | Mesaje de reactivare, rapoarte săptămânale goale | Oboseala de știri e motivul pentru care oamenii fug de știri |

## Întrebări deschise

- Andrei: câmpurile `zero`, `curios`, `expert` din `niveluri.json` sunt text simplu. Pentru Expert, linkurile sunt și în `surse`. Dacă vrei Markdown pentru bold sau linkuri în text, spune și le convertesc.
- Chris: formatul pentru `profesionist` (cine, cum îl contactezi) ca să-l leg de nivelul Expert.
- Matei: când apare `content/voice-rules.md`, trec toate textele prin reguli.
