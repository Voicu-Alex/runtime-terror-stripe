# Niveluri: surse, verificări și diferențe față de context

**Autor:** Iasmina · **Verificat la:** 28 octombrie 2026 · Textele sunt în [`niveluri.json`](niveluri.json).

Fiecare cifră și dată din `niveluri.json` a fost citită în textul oficial de pe Portalul Legislativ (legislatie.just.ro), în forma consolidată a actului și a Codului fiscal (ultima consolidare a Codului fiscal: 25.10.2026), sau într-un comunicat ANRE. Ce nu am putut confirma e marcat **TODO**.

Exemplele cu cifre din nivelul Curios (de exemplu „la 10.000 lei dividende, impozitul crește de la 1.000 la 1.600 lei”) sunt calcule simple pe cotele din lege, nu date despre persoane reale.

ID-urile sunt provizorii, până intră `data/catalog.json`. Doar `dividende-2026` vine din exemplul de catalog.

## Diferențe față de contextul din brief

| Act | Ce scria în context | Ce scrie în sursa oficială |
|---|---|---|
| Gaz, OUG 12/2026 | „Plafonarea la gaz prelungită” | Nu mai e un plafon fix. Între 1 aprilie 2026 și 31 martie 2027 plătești cel mai mic dintre prețul din contract și un preț calculat după formulă: 110 lei/MWh la producător (art. 6) plus maximum 15 lei/MWh componenta de furnizare (art. 3). Plafonul de **0,31 lei/kWh** era din OUG 6/2025 și s-a aplicat doar până la 31 martie 2026. |
| Energie, OUG 6/2025 | „Plafonarea eliminată (1 iul 2025)” | Corect. Plafonul nu era o singură valoare: 0,68, 0,80 sau 1,3 lei/kWh, după consum și categorie. Încetarea la 1 iulie 2025 o confirmă ANRE (comunicat din 11 iunie 2025), nu textul OUG. |
| CASS pe pensii, Legea 141/2025 | „CASS 10% pe pensiile peste 3.000 lei” | Corect, dar e **temporar**: se aplică între 1 august 2025 și 31 decembrie 2027 (art. VII alin. (3)). Pragul de 3.000 lei se scade separat pentru fiecare drept de pensie. |
| Dividende, Legea 141/2025 | „De la 10% la 16% (1 ian 2026)” | Corect. Contează data **distribuirii**, nu a plății. Dividendele distribuite pe baza situațiilor interimare din 2025 rămân la 10% (art. VII alin. (2)). |
| Micro, OUG 89/2025 | „Cotă 1%, plafon 100.000 EUR” | Cota de 1% e din OUG 89/2025. **Plafonul de 100.000 euro nu e din OUG 89/2025** (acolo apare doar în preambul), ci din Codul fiscal art. 47 alin. (1) lit. c), introdus prin OUG 156/2024 și rescris prin OUG 8/2026. Intrarea în vigoare e în art. II **alin. (1)**, nu „pct. 1”, cum scrie în `docs/research-v2.md`. |
| Pilon II, Legea 2/2026 | „Plată eșalonată, din 5 ian 2027” | Data e corectă (art. 113). Dar regimul nou **nu pornește automat**: până când ASF autorizează primul fond de plată prin retragere programată, plata se face după legile vechi (art. 111 alin. (1)). „8 ani” înseamnă **cel puțin** 8 ani, nu „până la”. Suma de 1.251 lei din presă nu e în lege: legea leagă rata lunară de indemnizația socială pentru pensionari. Legea se aplică și Pilonului III. |
| TVA, Legea 141/2025 | „De la 19% la 21%, reduse unificate la 11%” | Corect. Nuanță: o singură locuință putea fi cumpărată cu 9% până la 31 iulie 2026, cu condiții (art. III). |

## Pe acte

### energie-plafon-2025
- OUG 6/2025, Monitorul Oficial nr. 182 din 28 februarie 2025, art. 1 alin. (1) lit. a), b), f) și art. 2 alin. (2): https://legislatie.just.ro/Public/DetaliiDocument/295106
- Încetarea la 1 iulie 2025: comunicat ANRE din 11 iunie 2025: https://anre.ro/comunicat-de-presa-anre-lanseaza-o-campanie-nationala-de-informare-pentru-consumatorii-de-energie-electrica/
- Comparatorul oficial de oferte ANRE: https://posf.ro/
- **TODO:** OUG 35/2025 (sprijin pentru consumatorii în sărăcie energetică) și voucherele de 50 lei apar doar ca titlu ANRE sau în presă; nu sunt în texte.

### tva-2025
- Legea 141/2025, Monitorul Oficial nr. 699 din 25 iulie 2025, art. II pct. 42–45 (Codul fiscal art. 291), art. III (locuințe la 9%), art. VII alin. (1) (aplicare de la 1 august 2025): https://legislatie.just.ro/Public/DetaliiDocument/300022
- Codul fiscal consolidat: https://legislatie.just.ro/Public/DetaliiDocument/171282

### cass-pensii-2025
- Legea 141/2025, art. II pct. 16, 18, 21, 25; art. VII alin. (1) lit. e) (modificat prin OG 22/2025, Monitorul Oficial nr. 806 din 29 august 2025) și alin. (3): https://legislatie.just.ro/Public/DetaliiDocument/300022
- Cota de 10%: Codul fiscal art. 156: https://legislatie.just.ro/Public/DetaliiDocument/171282

### dividende-2026
- Legea 141/2025, art. II pct. 1 (Codul fiscal art. 43 alin. (2)) și pct. 5 (art. 97 alin. (7)); art. VII alin. (1) și (2): https://legislatie.just.ro/Public/DetaliiDocument/300022

### micro-2026
- OUG 89/2025, Monitorul Oficial nr. 1203 din 24 decembrie 2025, art. I pct. 4 și 5, art. II alin. (1): https://legislatie.just.ro/Public/DetaliiDocument/305817
- Plafonul, condițiile (art. 47 alin. (1) lit. c), g), h)) și întreprinderile legate (art. 47 alin. (1^1), art. 52 alin. (5^1)): Codul fiscal consolidat, https://legislatie.just.ro/Public/DetaliiDocument/171282
- OUG 156/2024 (introducerea plafonului de 100.000 euro de la 1 ianuarie 2026): https://legislatie.just.ro/Public/DetaliiDocument/293109
- **TODO:** OUG 8/2026 (Monitorul Oficial nr. 147 din 25 februarie 2026) a fost verificată prin notele din Codul fiscal consolidat, nu pe pagina proprie a actului. De adăugat linkul ei direct.

### pilon2-2027
- Legea 2/2026, Monitorul Oficial nr. 2 din 5 ianuarie 2026, art. 50, 55, 60, 61, 111, 113: https://legislatie.just.ro/Public/DetaliiDocument/306255
- **TODO:** valoarea actuală a indemnizației sociale pentru pensionari (de ea depinde rata lunară), dintr-o sursă oficială.
- **TODO:** un ghid ASF despre Legea 2/2026. Nu am găsit unul. În august 2026, ASF ar fi pus în consultare norma privind autorizarea fondurilor de plată, dar pagina n-a putut fi deschisă, deci nu e verificat.

### gaz-2026
- OUG 12/2026, Monitorul Oficial nr. 178 din 9 martie 2026, art. 1 alin. (1)–(2), art. 3, art. 5, art. 6: https://legislatie.just.ro/Public/DetaliiDocument/308129
- OUG 19/2026, Monitorul Oficial nr. 237 din 26 martie 2026, art. 10 (modifică OUG 12/2026): https://legislatie.just.ro/Public/DetaliiDocumentAfis/308479
- Plafonul anterior de 0,31 lei/kWh: OUG 6/2025, art. 1 alin. (3) lit. a): https://legislatie.just.ro/Public/DetaliiDocument/295106
- **TODO:** exemplul cu cifre din nivelul Curios. Formula nu dă un preț unic în lei/kWh; avem nevoie de un preț final oficial (ANRE) ca exemplu.
