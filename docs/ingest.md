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

## Volum și ce a dat prima rulare (29 oct 2026, noaptea)

| | Pe an (aprox.) | De unde |
|---|---|---|
| Documente pe Portal, toate tipurile | ≈ 11.000 | intervalul de id-uri ian → oct 2026 |
| Legi | 204 până pe 29 oct 2026; 248 în 2025; 332 în 2024 | lista cdep.ro |
| Numere din Monitorul Oficial, Partea I | ≈ 1.130–1.300 | numerele din decembrie 2024 și 2025 |

**Parcurgerea ultimelor 6 săptămâni** (id 314500 → 315900, `--dry-run --dump scratch/sweep`, 1 cerere / 2 s): la ora
scrierii 508 pagini, 508 răspunsuri 200, 0 lipsă, 0 erori, 0 reîncercări (jurnal: `scratch/sweep-log.txt`, copiat la final în `eval/rezultate/triaj-2026-10-29/`). În `--dry-run` nu există
cursor, deci reluarea se face cu `--de-la <ultimul id văzut>`; `--reia` merge doar cu baza de date.

| Pasul | Rezultat pe primele 508 acte |
|---|---|
| Tipuri | ORDIN 206, HOTĂRÂRE 104, DECIZIA (CCR) 49, RAPORT 40, DECRET 34, DECIZIE 22, RECTIFICARE 8, altele |
| Regulile de triaj | 167 candidați (33%), 341 respinși |
| Triajul Haiku (subagenți, 125 de candidați în 7 loturi de 20) | 43 ating banii (34% din candidați, ≈ 9% din total), 82 nu |
| Interpretate cu Sonnet (6 alese din cele 43) | 3 cu schimbări (burse 450/300/300 lei, rovinieta pe categorii, alocația de plasament și alocația pentru tineri), 3 respinse corect la triajul fin (banii merg la instituții sau anexa lipsește) |

Deci din ≈ 31 de acte pe zi rămân ≈ 3 pe zi de interpretat, adică ≈ 1.000 pe an. Cu subagenți: 1–3 minute pe act. Prin
API, la prețul Haiku măsurat (0,006 USD pe act): ≈ 6 USD pe an; cu Sonnet ≈ 90 USD pe an.

**Actele campaniilor și cele alese** (12, aduse după id): 88 de schimbări propuse, 76 cu etichetă (aprobabile), toate
citatele găsite textual; detalii și paritatea cu API-ul în `docs/eval-modele.md`, runda 4.

## Ce nu e verificat încă și ce lipsește

- Limita reală de cereri a Portalului: nu e documentată; am stat la 1 cerere / 2 s și n-am primit niciun 403/429.
- Pagina actului nu dă data intrării în vigoare; modelul o ia din text sau aplică regula generală (regula 13), marcată.
- Pagina actului nu conține mereu anexele (ex. regulamentul voucherelor de vacanță, Ordinul 5.651/2026): un act poate
  părea gol. De adăugat: urmărirea linkurilor spre anexe.
- Scrierea în Supabase (`legi:migreaza`, `legi:incarca`, `legi:importa`, `legi:aproba`, /admin/acte pe date reale) nu a
  rulat: lipsește parola bazei în `SUPABASE_DB_URL`.
- Triajul Haiku e reglat pe recall („de citit integral” când textul e tăiat la 4.000 de caractere): despăgubirile de
  expropriere trec ca „ating banii” deși privesc câțiva proprietari.
- Proiectele (SGG) nu sunt implementate.
