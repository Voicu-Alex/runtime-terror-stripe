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

## Cum se rulează din nou

```bash
node eval/descarca-acte.mjs        # textele legilor, fără cheie
python eval/genereaza-documente.py # documentele fictive noi
node eval/scor.mjs                 # notează eval/rezultate/<model>/
node eval/numara-actiuni.mjs       # câte acțiuni și linkuri pe model
```

Rezultatele brute: `eval/rezultate/{sonnet,haiku}/{documente,legi}/`. Așteptările: `eval/asteptari-documente.json`, `eval/asteptari-legi.json`.

## Neverificat

- Subagenții nu sunt identici cu apelul real de API: fără validarea schemei de către API, alt prompt de sistem în jur, setări de gândire diferite. Pe API, Sonnet și Haiku **nu** au fost rulați.
- O singură rulare pe model: nu știm cât variază răspunsul de la o rulare la alta.
- Am verificat de mână rezumatele pe HG 146, Legea 161, OUG 12, OUG 29 și Legea 204. Cele 8 schimbări găsite în OUG 89/2025 și cele 3 din OUG 6/2025 nu le-am verificat rând cu rând.
- Sonnet a citit OUG 89 și OUG 6 pe bucăți, nu integral; poate rata schimbări.
- Așteptările le-am scris eu; pe actele noi nu au fost revăzute de altcineva.
- Costul pe API e estimat din prețul de listă, nu măsurat.
