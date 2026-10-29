# Surse de date pentru legi și ce înseamnă pentru profil

Verificat pe 28 octombrie 2026 (Voicu). Ce n-am putut confirma e marcat.

## Întrebarea

Motorul promite că „citește Monitorul Oficial” și spune fiecărui om ce lege îl atinge. De unde ia legile un program, în format pe care îl poate citi?

## Ce există

| Sursă | Ce oferă | Verdict |
|---|---|---|
| **Portalul Legislativ, serviciul web** ([documentație](https://legislatie.just.ro/serviciulweblegislatie.htm), [WSDL](https://legislatie.just.ro/apiws/FreeWebService.svc?wsdl=)) | API SOAP oficial, gratuit, fără înregistrare. `GetToken` dă un token cu valabilitate limitată; `Search(SearchModel, tokenKey)` caută după an, număr, titlu sau text, paginat (10 rezultate pe pagină). Întoarce `Titlu`, `Emitent`, `TipAct`, `Numar`, `Publicatie` (numărul din MO), `DataVigoare` și `Text`. | **Sursa principală.** Zilnic: căutare după anul curent, se compară cu ce avem deja, actele noi intră în coada de etichetare. |
| **Monitorul Oficial, e-Monitor** | Partea I e gratuită online din 2017 (modificarea Legii 202/1998), ca PDF, cu sumar pe numere. Fără API, fără date deschise. | Sursa de adevăr pentru „a apărut azi”, dar doar ca PDF. Portalul Legislativ indexează aceleași acte în câteva zile. |
| **data.gov.ro** | Căutarea „legislație” dă 5 seturi, niciunul despre acte normative. | Nimic util. |
| **cdep.ro, senat.ro** (proiecte de lege) | Doar pagini HTML; n-am găsit date deschise. | Doar dacă afișăm și etapa „proiect”, ceea ce nu facem în prima versiune. |
| **Wrapper-e neoficiale** ([ro-eli-mcp](https://github.com/matematicsolutions/ro-eli-mcp), [RO-LEX](https://www.ro-lex.ro/home)) | Folosesc același API; RO-LEX a atribuit identificatori ELI pentru peste 100.000 de acte. | Utile ca exemplu de cod; nu depindem de ele. |

## Testat pe 28 oct 2026 (Andrei)

- **Merge din browser și din cod.** Din browser: WSDL, `GetToken` și `Search` răspund 200. Din Node/`curl` (de pe mașina lui Andrei), tot 200, atât fără `User-Agent`, cât și cu unul care spune cine suntem (`ce-inseamna-pentru-mine/0.1 (hackathon prototip)`). Nu am imitat un browser. 403-ul de pe mașina lui Voicu ține probabil de rețea sau IP, nu de client.
- Endpoint: `POST https://legislatie.just.ro/apiws/FreeWebService.svc/SOAP`, `Content-Type: text/xml; charset=utf-8`, `SOAPAction: "http://tempuri.org/IFreeWebService/Search"` (sau `.../GetToken`). În `SearchModel` câmpurile sunt în namespace-ul `http://schemas.datacontract.org/2004/07/FreeWebService`: `NumarPagina` (de la 0), `RezultatePagina`, `SearchAn`, `SearchNumar`, `SearchText`, `SearchTitlu`.
- Un `Search` pe an + număr durează ~0,5 s. Rezultatele includ toate tipurile de acte cu acel număr (ordin, hotărâre, decret, lege), deci se filtrează după `TipAct`.
- **`Text` e forma de bază, nu cea consolidată.** Exemplu: pentru Legea 61/1993 `Text` are cuantumul din 1993 (3.500 lei); forma consolidată de pe portal (DetaliiDocument/248212) are art. 3 modificat prin OUG 126/2021 (243 lei din 2022, indexat anual). Pentru modificări și abrogări trebuie citită și pagina actului (istoricul consolidărilor și nota de abrogare).
- Exemplu de abrogare prinsă așa: **Legea 277/2010 (alocația pentru susținerea familiei) e abrogată din 1 ian 2024** prin art. 96 lit. b) din Legea 196/2016 (venitul minim de incluziune). Catalogul a fost corectat.

## Sondat pe 29 oct 2026 (Andrei cu Claude, 9 cereri)

- **Serviciul SOAP nu e bun pentru descoperire.** `RezultatePagina` e plafonat la 10 (am cerut 100, am primit 10) și
  `NumarPagina` e ignorat: pagina 0 și pagina 1 întorc aceleași 10 acte, atât pentru căutarea pe an, cât și pe an + număr.
  `Publicatie` e literal „Monitorul Oficial”, fără număr. Un răspuns are ≈ 216 KB pentru că vine și `Text`.
  Căutarea `SearchTitlu=impozit` pe 2026 a dat un singur act. Rămâne util pentru a afla id-ul unui act după an și număr.
- **Pagina actului e sursa.** `https://legislatie.just.ro/Public/DetaliiDocument/<id>` e randată pe server (fără
  `__VIEWSTATE`), 54 KB pentru Legea 204/2026, 200 ms. Conține „LEGE 204 22/10/2026” în titlu, „EMITENT PARLAMENTUL
  ROMÂNIEI”, „Publicat în MONITORUL OFICIAL nr. 886 din 22 octombrie 2026” și articolele. Id-urile cresc în ordinea
  publicării: 306250 pe 5 ian 2026, 315641 pe 22 oct 2026, deci ≈ 31 de acte pe zi, ≈ 11.000 pe an, toate tipurile
  (LISTĂ, DECIZIE, DECRET, ORDIN, HOTĂRÂRE, LEGE, CIRCULARĂ, NORMĂ…).
- **Termeni** (`/Public/Termeni`): textele oficiale nu sunt protejate de drept de autor; formele consolidate sunt
  neoficiale. Nu există robots.txt (302 spre /Error) și nicio limită de cereri documentată.
- **Proiecte:** singura listă oficială citibilă din script e `sgg.gov.ro/1/anunturi-proiecte-de-acte-normative/` (titlu,
  PDF, dată, termen de consultare). mfinante.gov.ro, anaf.ro, anre.ro și mmuncii.ro nu răspund scripturilor (403, 404,
  conexiune refuzată). cdep.ro are lista proiectelor de lege pe ORDS; senat.ro cere postback.

Implementarea: `docs/ingest.md`.

## Neconfirmat

- Limita de cereri a API-ului: nu am făcut decât câteva zeci de apeluri.
- Nu există un filtru „publicate după data X”. Varianta practică: căutare după an, cu numere crescătoare, și comparare cu ce avem deja.

## Ce înseamnă pentru motor

1. **Zilnic:** `Search(SearchAn = anul curent)`, paginat, până la actele deja văzute. Actele noi intră în coada de etichetare.
2. **LLM-ul propune** pentru fiecare act: etichetele (doar din taxonomie), condițiile numerice, formula (doar din lista existentă) și textele pe niveluri.
3. **Un om aprobă.** Abia apoi intrarea primește `verificat_la` și intră în catalog.
4. **Backlog-ul:** nu pornim de la 100.000 de acte. Pornim de la o listă curatoriată de circa 30 de „legi ale banilor” (Codul fiscal, Legea 360/2023 a pensiilor, Legea 61/1993 a alocațiilor, Legea 277/2010, VMI, legea energiei), etichetate o dată.

## Profilul: nu doar etichete, ci și cifre

Legile românești se aplică rar după „ești pensionar”. De obicei se aplică după un număr: pensia peste 3.000 lei, copil sub 2 ani sau sub 18, venit net pe membru de familie sub un prag, vârsta de pensionare. De aceea:

- **Condițiile** din catalog sunt numerice (`camp`, `op`, `valoare`) și se evaluează pe valorile din profil. O valoare lipsă dă starea „posibil” și aplicația știe exact ce să ceară.
- **Valorile** din profil (28 oct 2026): salariu net și brut, pensie, dividende pe an, cheltuieli pe lună, venit net pe membru de familie, anul nașterii (vârsta se derivă la potrivire), numărul copiilor, vârsta celui mai mic copil, persoane în întreținere.
- **Etichetele** au 7 familii: cum câștig, ce dețin, cine depinde de mine (inclusiv **părinte singur**, persoană cu handicap în întreținere), ce conduc, unde locuiesc (inclusiv **rural**), domeniul meu, **situația mea** (elev sau student, în șomaj, persoană cu handicap, în concediu de creștere, pe salariul minim).

Exemple de acte pe care le-am rata fără cifre, de verificat în text înainte să intre cu sume în catalog: alocația de stat pentru copii (292 lei pe lună între 2 și 18 ani, cifră din presă pentru 2026), alocația pentru susținerea familiei (depinde de venitul pe membru și de școlarizare), venitul minim de incluziune, deducerea personală la salarii mici, scutirea de impozit pentru persoanele cu handicap grav, vârsta de pensionare care crește treptat pentru femei până în 2035.

## Surse secundare folosite aici

- [Monitorul Oficial gratuit online, G4Media](https://www.g4media.ro/monitorul-oficial-va-fi-accesibil-gratuit-integral-online-premiera-noul-format-va-permite-inclusiv-cautarea-in-interiorul-documentelor.html)
- [Legea promulgată pentru e-Monitor gratuit, Economica](https://www.economica.net/lege-promulgata-monitorul-oficial-in-format-electronic-disponibil-gratuit-permanent_501962.html)
- [data.gov.ro, căutare „legislație”](https://data.gov.ro/dataset?q=legislatie)
- [Alocația pentru susținerea familiei, Playtech](https://playtech.ro/2025/alocatia-pentru-sustinerea-familiei-cine-o-poate-primi-conditii-si-valoarea-actuala/)
- [Alocația pentru copii 2026, ProTV](https://stirileprotv.ro/divers/alocatia-pentru-copii-2026-cine-are-dreptul-valoarea-si-pasii-pentru-a-o-solicita.html)
