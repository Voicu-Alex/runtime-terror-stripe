# Ingestia actelor: de pe Portalul Legislativ în Supabase, apoi în catalog

*Andrei cu Claude, 29 octombrie 2026. Branch `legi-ingest`.*

Ce face: descoperă actele noi, le păstrează cu textul lor, le triază, le dă unui model să le interpreteze în formatul
cardurilor, verifică automat propunerea și o pune în fața unui om. Nimic nu intră în catalog fără aprobare.

## Pe scurt

```
descopera (pagini de act, 1 cerere / 2 s) ─► acte ─► reguli de triaj ─► candidat
export-lot ─► scratch/lot/<id>.txt ─► model (subagenți acum, API în producție) ─► scratch/lot/<id>.json
importa-interpretari (verificări automate) ─► interpretari (propus) ─► /admin/acte ─► aprobă ─► schimbari + ghid
```

## Sursele și de ce

| Sursă | Cum o citim | Verdict (29 oct 2026) |
|---|---|---|
| legislatie.just.ro, pagina actului `Public/DetaliiDocument/<id>` | HTML randat pe server, 54 KB pentru o lege scurtă, 200 ms. Are titlul, tipul, numărul, emitentul, „Publicat în MONITORUL OFICIAL nr. … din …” și textul. Id-urile cresc în ordinea publicării: 306250 (5 ian 2026) → 315641 (22 oct 2026), adică ≈ 31 de acte pe zi, ≈ 11.000 pe an, toate tipurile. | **Sursa principală.** Parcurgem id-urile în ordine. |
| legislatie.just.ro, serviciul SOAP | Întoarce cel mult 10 rezultate și ignoră numărul paginii (pagina 0 și 1 dau aceleași acte). `Publicatie` e literal „Monitorul Oficial”, fără număr. | Doar pentru a afla id-ul unui act după an și număr (`--cauta-oug`). |
| sgg.gov.ro/1/anunturi-proiecte-de-acte-normative | Lista oficială a proiectelor în transparență decizională: titlu, PDF, dată, termen de consultare; HTML randat pe server. | Proiectele, într-un pas următor (`proiecte.mts`, neimplementat). |
| cdep.ro (ORDS), senat.ro | Proiecte de lege; Senatul cere postback ASP.NET. | Nu în prima versiune. |
| Monitorul Oficial | Doar PDF, `Crawl-delay: 30`. | Nu îl citim; numărul MO îl luăm din pagina actului. |
| mfinante.gov.ro, anaf.ro, anre.ro, mmuncii.ro | Inaccesibile din script (403, 404, conexiune refuzată). | Nu. SGG le republică proiectele. |

Termenii Portalului (`/Public/Termeni`): textele oficiale nu sunt protejate de drept de autor; formele consolidate sunt
neoficiale. Nu există robots.txt și nici o limită de cereri documentată.

## Politețea față de site

- O singură cerere la un moment dat, pe un singur fir. 2 secunde între cereri (`--pauza`).
- `User-Agent: ce-inseamna-pentru-mine/0.1 (hackathon; github.com/Voicu-Alex/runtime-terror-stripe)`.
- La 403, 429 sau 5xx: 30 s pauză și o reîncercare, apoi 2 minute și încă una, apoi rularea se oprește.
- Cel mult 1.500 de cereri pe rulare (≈ 50 de minute). Cursorul se salvează la fiecare 50 de id-uri, deci orice rulare
  se reia de unde a rămas (`--reia`).
- Fiecare rulare lasă un rând în `rulari`: câte cereri, câte 200 / 404 / altele, câte acte noi. Așa dovedim că am stat sub
  limită.
- Doar `descopera.mts` vorbește cu Portalul. Agenții care interpretează citesc fișiere locale.

## Cum se rulează

```bash
npm run legi:migreaza                 # o dată: tabelele acte, interpretari, rulari, cursor_surse (cere SUPABASE_DB_URL)
npm run legi:descopera -- --ids 293109,305208,171282,313202,308123,33919   # actele campaniilor, după id
npm run legi:descopera -- --de-la 314500 --pana-la 315900                   # ultimele 6 săptămâni din 2026
npm run legi:export-lot -- --stare candidat --max 20                        # textele pentru model, în scratch/lot/
# modelul scrie scratch/lot/<id>.json (subagenți Claude Code, sau eval/interpreteaza-api.mjs prin API)
npm run legi:importa                                                        # verificări automate, apoi interpretari (propus)
# /admin/acte: un om aprobă sau respinge
npm run legi:aproba -- <id> --revizor <email>                               # alternativa din linia de comandă
```

Fără API: descoperirea citește paginile direct, iar interpretarea o fac subagenții Claude Code. Cheia Anthropic se
folosește doar pentru verificarea de paritate pe 3–5 acte (`eval/interpreteaza-api.mjs`).

## Volum

| | Pe an (aprox.) | De unde |
|---|---|---|
| Documente pe Portal, toate tipurile | ≈ 11.000 | intervalul de id-uri ian → oct 2026 |
| Legi | 204 până pe 29 oct 2026; 248 în 2025; 332 în 2024 | lista cdep.ro |
| Numere din Monitorul Oficial, Partea I | ≈ 1.130–1.300 | numerele din decembrie 2024 și 2025 |
| OUG / OG / HG / Ordine | TODO după prima parcurgere | `rulari`, `acte` pe `tip_act` |

Regulile de triaj (tip de act, emitent, cuvinte din titlu) păstrează o parte mică din total; din ele, triajul cu
Haiku păstrează doar actele care ating banii unei persoane. Rezultatele primei rulări: TODO.

## Ce nu e verificat încă

- Limita reală de cereri a Portalului: nu e documentată; am stat la 1 cerere / 2 s.
- Data intrării în vigoare: dacă pagina actului o conține; altfel rămâne din text sau de la model.
- Proiectele (SGG) nu sunt implementate.
