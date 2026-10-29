# Evaluare: Sonnet vs Haiku pe documente și pe interpretarea legilor

28 octombrie 2026, Andrei cu Claude. Rulat cu subagenți Claude Code (Sonnet 5.5 și Haiku 5.5), **fără cheie de API**, la cererea lui Andrei: testăm comportamentul, cheia vine când aplicația e gata.

## Pe scurt

| | Sonnet | Haiku |
|---|---|---|
| Documente (13, cu așteptări) | **13/13** | **13/13** |
| Legi: triaj (atinge banii sau nu, 9 acte) | 9/9 | 9/9 |
| Legi: etichete corecte, doar din listă | 9/9 | 9/9 |
| Legi: data publicării | 9/9 | 9/9 |
| Legi: citatul găsit textual în act | 16/16 | 18/18 |
| Legi: formule existente | 4/4 | 3/3 |
| Legi: linkuri pe domenii oficiale, care răspund 200 | 6/6 | 4/4 |
| Legi: fără „recomandăm / cel mai bun / garantat” | 9/9 | 9/9 |
| Acțiuni propuse (pe 16 / 18 schimbări) | **6** (6 cu link) | **4** (4 cu link) |
| Timp de rulare, legi | ~4 min | ~9 min |

**Concluzie:** pentru **documente**, Haiku e la fel de bun ca Sonnet pe acest set și e de ~20 de ori mai ieftin la prețul de listă ($0,10 / $0,50 vs $2 / $10 pe milion de tokeni). Pentru **legi**, ambele sunt corecte pe fapte; Sonnet scrie mai des „ce poți face” cu link și un rezumat mai simplu, Haiku lasă des acțiunile goale. Recomandare: **Haiku pentru documente și triaj, Sonnet pentru interpretarea completă**, cu om în buclă (`/admin`). Decizia de model e a echipei; ruta de documente folosește acum `claude-opus-5-5`.

## Ce am testat

### Documente (`test-docs/`, toate fictive)

Cele 7 ale lui Voicu, plus 6 noi (`eval/genereaza-documente.py`), fiecare pentru o regulă:

| Document nou | Ce verifică |
|---|---|
| `extras-cont.png` | extrasele de cont nu se folosesc: fără etichete deduse din tranzacții, IBAN și CNP nu apar |
| `factura-pfa-emisa.pdf` | o factură emisă de om ca PFA dă `pfa`, nu o etichetă de consumator |
| `extras-pilon2.png` | `pilon2`; CNP-ul nu apare |
| `bon-fiscal.png` | nimic de etichetat |
| `fluturas-it-2026.png` | extragere corectă (brut 10.000, net 6.500) și pe un fluturaș care aplică încă scutirea IT |
| `cupon-pensie-rotit.png` | poză rotită, contrast slab: `pensionar`, 2.800 lei, doar anul nașterii |

Agentul primește exact instrucțiunile aplicației (`INSTRUCTIUNI_MODEL` și `SCHEMA_ANALIZA` din `lib/analiza-document.ts`) și un document, fără acces la răspunsurile așteptate.

### Legi (`eval/legi/`, textul oficial prin API-ul Portalului Legislativ)

| Act | De ce e în set |
|---|---|
| OUG 12/2026 (gaz), OUG 89/2025 (micro), OUG 6/2025 (energie și gaz) | deja verificate în catalog; OUG 89 și OUG 6 au peste 100.000 de caractere |
| HG 146/2026 | salariul minim 4.325 lei din 1 iulie 2026 |
| Legea 161/2026 | TVA 9% la locuință (termen trecut, 30 sep 2026) și restituirea diferenței (din 1 oct 2026) |
| OUG 29/2026 | mai ales angajări în sectorul public; un singur articol atinge indirect salariul minim |
| Legea 204/2026 | pare doar o lege de aprobare, dar adaugă scutirea de accize pentru 200 l/an de băutură tradițională în gospodăriile din Registrul agricol |
| HG 573/2026, HG 603/2026 | negative: un proiect de investiții și măsuri de siguranță pe rețea; nu ating banii unei persoane |

Instrucțiunile de interpretare sunt în `eval/interpretare/instructiuni.md` (triaj, etichete din listă, citat textual, formulă doar din `lib/formule.ts`, linkuri doar oficiale, fără sfat financiar).

## Ce am găsit

1. **Extrasul de cont (ambele modele, prima rulare):** au dedus `chirias` și `consumator_gaz` din plăți. Am adăugat regula 9 în `INSTRUCTIUNI_MODEL` (extrasele nu se folosesc, nu deduci etichete din tranzacții); a doua rulare, ambele corecte. E singura corectură de instrucțiuni din această rundă.
2. **Nimic inventat acolo unde actul trimite la alt act.** OUG 29 (art. LXX din OUG 156/2024) și Legea 204 (OG 22/2025): niciunul nu a descris conținutul actului la care se face trimitere; Haiku a scris explicit în `nota` că e de verificat.
3. **Negativele:** ambele au întors `atinge_banii: false` pe HG 573 și HG 603.
4. **Linkuri:** toate cele 10 linkuri propuse sunt pe domenii oficiale (legislatie.just.ro, anaf.ro, posf.ro) și răspund 200. Niciun link inventat.
5. **Două erori în așteptările mele, nu ale modelelor:** OUG 6/2025 acoperă și gazul (titlul o spune), iar „garantat în plată” e termenul din lege pentru salariul minim, nu o promisiune. Am corectat verificarea.
6. **Pe Opus, prin API real (înainte de această rundă):** 3 din 7 documente au cerut reguli noi (net pe fluturaș, pensia brută, etichetele chiriașului); acum sunt în instrucțiuni.

## Runda 2: acțiuni tipizate, destinații, formule parametrizate (28 oct 2026, seara)

Ce s-a schimbat (planul în 4 pași, cu Fable ca advisor):

1. **Acțiuni tipizate.** Fiecare acțiune are `tip` (`fa`, `verifica`, `nimic_pana_la`), `cine_aplica` (`tu`, `angajator`, `furnizor`, `stat`) și `destinatie`. Regula 7 din `eval/interpretare/instructiuni.md` cere cel puțin o acțiune pentru fiecare schimbare activă; o verificare a ceea ce cere legea („salariul de bază brut trebuie să fie cel puțin…”) nu e sfat financiar.
2. **Destinații verificate** (`data/destinatii.json`): 10 adrese exacte (comparatorul ANRE, Declarația unică online, portalul de formulare ANAF, ghidul SPV, cererea RO e-Factura 2026, CNPP, Inspecția Muncii, registrul ASF, CECCAR, CCF) și 4 ghișee fără URL (primăria, HR-ul angajatorului, furnizorul, fondul de pensii). Modelul alege un id, nu scrie URL-uri; ce lipsește propune în `destinatie_propusa`, pentru un om. `node scripts/verifica-destinatii.mjs` verifică zilnic fiecare URL (status 200 și titlul așteptat sau PDF): 10/10.
3. **Formule parametrizate** (`lib/formule-tip.ts`): `suma_fixa_lunar`, `schimbare_cota`, `diferenta_prag`, `scutire`. Modelul copiază numerele din lege; `parametriInText` respinge orice număr care nu apare în textul actului. Cota veche (de obicei absentă din actul nou) o dă un om, cu sursa.
4. **„Spune-ne X” pe card:** când formulei îi lipsește o valoare din profil, cardul o cere; valoarea se păstrează în browser, pe persoana demo, și se recalculează toate cardurile. Persoana demo nouă **Elena, 24** (fictivă, pe salariul minim, fără brut în profil) arată fluxul: introduce 4.050 lei → „+275 lei/lună brut”.

Exemplul din instrucțiunile v2 e un act inventat; un exemplu cu HG 146/2026 (din setul de test) și două comentarii-indiciu din `lib/formule-tip.ts` au fost scoase înainte de rulare, ca testul să nu fie contaminat.

| | Haiku v1 → v2 | Sonnet v1 → v2 |
|---|---|---|
| Schimbări active cu cel puțin o acțiune | 3/15 → **15/15** | 5/12 → **11/11** |
| Acțiuni valide (tip, cine, termen la „nimic până la”, fără URL scris de model) | **15/15** | **14/14** |
| Destinații din listă, existente | **11/11** | **8/8** |
| Destinații noi propuse pentru verificare | 4 | 2 |
| Formule parametrizate cu numerele găsite în lege | **4/4** | **1/1** |
| Triaj, etichete, date, citate, ton | toate trec | toate trec |

Pe HG 146/2026 ambele au ales `diferenta_prag` cu 4.325 lei. Haiku a folosit și `suma_fixa_lunar` 200 lei (OUG 89/2025, a doua jumătate a lui 2026) și `scutire` pe impozitul pe clădiri pentru sere. Destinațiile propuse: procedura ANAF de restituire a TVA la locuință, declarația micro, școala (Masă sănătoasă), asociația de proprietari, pagina pentru sărăcia energetică.

**Concluzie v2:** după schimbarea instrucțiunilor, Haiku nu mai lasă acțiunile goale; diferența față de Sonnet se reduce la formulări. Pentru interpretare, Haiku devine o opțiune reală (de ~20 de ori mai ieftin); decizia rămâne a echipei.

**Găsit:** nu există o etichetă pentru „cumpăr o locuință”; Sonnet a lăsat Legea 161/2026 fără etichete, deci cardul nu ar ajunge la nimeni. De adăugat în `lib/taguri.ts` (decizie de echipă).

## Runda 3: API real (28 oct 2026, noaptea)

Cu cheia din `.env.local`. Legile: `eval/interpreteaza-api.mjs` (aceleași instrucțiuni v2 ca subagenții, cu fișierele pe care le citeau ei puse în promptul de sistem, memorat în cache). Documentele: `eval/documente-api.mjs`, prin ruta reală `/api/analiza-document` (Opus 5.5).

| | Haiku 5.5 (API) | Sonnet 5.5 (API) |
|---|---|---|
| Triaj, etichete, data publicării, ton (9 acte) | 9/9 la toate | 9/9 la toate |
| Citate găsite textual în act | 18/18 | 21/21 |
| Schimbări active cu acțiune | 16/16 | 15/15 |
| Acțiuni valide / destinații din listă | 16/16 · 12/12 | 19/19 · 12/12 |
| Formule parametrizate cu numerele în lege | 3/3 | 1/1 |
| Timp, 9 acte | 224 s | 368 s |
| **Cost măsurat (usage din API), 9 acte** | **0,04 USD** | **0,85 USD** |

Pe API real, Haiku face aceeași treabă ca Sonnet pe acest set, de ~20 de ori mai ieftin. Legea 161/2026 primește `cumpar_locuinta` la amândouă (în rulările cu subagenți eticheta nu exista încă pe branch; de aceea acolo apare acum 8/9 la etichete).

**Documente pe Opus, prin rută:**

| Rulare | Rezultat | Ce s-a schimbat după |
|---|---|---|
| 1 | 11/13: salariul net lipsea pe ambele fluturașe (era în explicație), iar câmpurile fără legătură veneau cu 0 sau "" | schema cere fiecare valoare (poate fi `null`); ruta aruncă `null`, 0 și textul gol (`curataValori`) |
| 2 | 13/13, dar factura de gaz a primit „rural” cu încredere 0,05 („nu se potrivește”) | regula 10 (nu propui o etichetă ca să spui că nu se potrivește) și ruta aruncă propunerile sub 0,2 |
| 3 | **13/13**, valori curate (net și brut pe fluturașe, pensia și anul nașterii pe cupon) | — |

**De ce conta:** `components/FormularProfil.tsx` pune automat în profil orice valoare numerică primită. Cu prima rulare, un fluturaș ar fi pus `cheltuieli_lunare: 0` în profil și ar fi anulat calculul TVA. Subagenții nu arătaseră problema: e un efect al schemei de răspuns din API.

Costul documentelor nu e măsurat (ruta nu înregistrează tokenii); estimare pe prețul de listă Opus 5.5: ~0,4 USD pe rulare de 13 documente.

## Cum se rulează din nou

```bash
node eval/descarca-acte.mjs        # textele legilor, fără cheie
python eval/genereaza-documente.py # documentele fictive noi
node eval/scor.mjs                 # notează eval/rezultate/<model>/
node eval/numara-actiuni.mjs       # câte acțiuni și linkuri pe model
node eval/detalii-v2.mjs           # formulele, destinațiile alese și propuse (v2)
node scripts/verifica-destinatii.mjs # verificarea zilnică a destinațiilor
node --env-file=.env.local eval/interpreteaza-api.mjs claude-haiku-5-5   # legile, API real (costă)
node eval/documente-api.mjs http://localhost:3010 opus-api-v3          # documentele prin rută (cere npm run dev și cheia)
```

Rezultatele brute: `eval/rezultate/{sonnet,haiku}/{documente,legi}/`. Așteptările: `eval/asteptari-documente.json`, `eval/asteptari-legi.json`.

## Neverificat

- Subagenții nu sunt identici cu apelul real de API: fără validarea schemei de către API, alt prompt de sistem în jur, setări de gândire diferite. Pe API, Sonnet și Haiku **nu** au fost rulați.
- O singură rulare pe model: nu știm cât variază răspunsul de la o rulare la alta.
- Am verificat de mână rezumatele pe HG 146, Legea 161, OUG 12, OUG 29 și Legea 204. Cele 8 schimbări găsite în OUG 89/2025 și cele 3 din OUG 6/2025 nu le-am verificat rând cu rând.
- Sonnet a citit OUG 89 și OUG 6 pe bucăți, nu integral; poate rata schimbări.
- Așteptările le-am scris eu; pe actele noi nu au fost revăzute de altcineva.
- Costul pe API e estimat din prețul de listă, nu măsurat.
- Runda 2: o singură rulare pe model. Cardul salariului minim apare doar de la 4.050 lei brut (minimul anterior, OUG 89/2025), ca să nu afișeze o sumă umflată la normă parțială; o normă parțială reală nu primește deci deloc cardul. Suma netă din brut nu e calculată (lipsește tabelul de deduceri).
- Destinațiile propuse de modele nu au fost încă verificate și adăugate în listă.

## Runda 4: pipeline-ul de ingestie, subagenți vs API pe aceleași loturi (29 oct 2026, noaptea)

Branch `legi-ingest` (`docs/ingest.md`). Cele 12 acte ale campaniilor și cele alese au fost aduse de pe Portal
(`descopera --dump`), tăiate pe articole unde erau coduri întregi (`export-lot`) și interpretate de 12 subagenți Sonnet 5.5,
unul pe act, cu instrucțiunile v3. Poarta de import (`lib/verificari-interpretare.ts`, aceleași verificări ca
`eval/scor.mjs`, plus condiții, date ISO, `rezumat_en`) a dat:

| | Subagenți Sonnet 5.5 |
|---|---|
| Acte / schimbări propuse | 12 / 80 |
| Citate găsite textual în lot | 80/80 |
| Acte fără nicio verificare picată | 9/12 |
| Schimbări blocate la aprobare (fără etichetă din listă: cripto, titluri, TVA 21% general, asigurare voluntară de șomaj) | 8/80 |
| Alte verificări picate | 0 |

Paritate cu API-ul (Andrei: „doar câteva prin API”): aceleași 3 loturi, Haiku 5.5 prin `eval/interpreteaza-api.mjs`
(`LOT=scratch/lot`), 0,019 USD în total.

| Act | Subagent Sonnet | API Haiku | Diferențe |
|---|---|---|---|
| HG 146/2026 | 1 schimbare, `diferenta_prag` 4.325, `verifica`/angajator | identic | doar formularea titlului |
| Legea 161/2026 | 2 schimbări (fereastra 9% expirată; restituirea), `cumpar_locuinta` | identic | formulare |
| OUG 11/2026 | 5 schimbări (prima de stabilitate `suma_fixa_lunar` 1.000, 4 secundare) | 8 schimbări (în plus: subvenția angajatorului de 2.250 lei etichetată `micro`, șomajul de lungă durată sub 30 de ani, victime ale violenței) | Haiku taie mai larg; ambele dau prima de stabilitate doar tinerilor NEET 16–29 |

Poarta a prins la API `publicat_la: null` pe două acte: loturile fuseseră exportate înainte să adăugăm linia „Publicat în”
în antet. Cu antetul nou nu se mai întâmplă.

**Concluzie:** aceeași formă, aceleași verificări, aceeași poartă pentru ambii driveri; subagenții sunt înlocuitorul
API-ului doar pe durata hackathonului. Corectură de fond găsită de interpretare: prima de stabilitate (OUG 11/2026, art.
76^5) e doar pentru tinerii NEET de 16–29 de ani înregistrați la agenție, nu pentru oricine la primul job.

**Neverificat:** o singură rulare pe act; conținutul celor 80 de schimbări nu a fost citit rând cu rând de un om
(spot-check Opus pe 5 acte: vezi mai jos, dacă există).
