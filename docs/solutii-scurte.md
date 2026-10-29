# Soluție scurtă în legea deschisă

29 octombrie 2026 — implementarea cerută după simplificarea conceptului de recomandări.

La deschiderea unei legi afișăm un paragraf „Ce poți face acum”, apoi „Poți discuta, de exemplu, cu:” și linkuri directe către site-urile consultanților. Fără pagină separată, modal, formular, checklist sau urmărire a cererilor. Layoutul rămâne minimal pentru revizuirea utilizatorului.

Implementat în `components/CardSchimbare.tsx` și `mockup/v6/index.html` (Pentru tine și Noutăți). În v6 se păstrează accesul existent la ghiduri; un teaser blocat nu afișează soluția. Proiectele și legile fără o asociere editorială nu primesc automat consultanți.

## Conținut și întreținere

- Sursa comună: `data/solutii.json`. Asocierile acoperă fiscalitate/PFA/SRL, salarizare, locuințe, energie și gaze, pensii, beneficii și auto. Categoria este editorială; firmele sunt asociate explicit fiecărei legi.
- React: `lib/solutii.ts` și `components/SolutieScurta.tsx`.
- v6: `solutii.js` randează `solutii-date.js`, generat din registrul soluțiilor și `data/destinatii.json` prin `node scripts/genereaza-solutii.mjs`. Generarea rulează și înainte de dev/build prin scriptul de publicare v6.
- Textele sunt sugestii scurte de pregătire a discuției, bazate pe ghidul și întrebările existente din catalog; nu adaugă sume sau termene legale.
- Site-uri și servicii verificate pe 29 octombrie 2026: [BDO — consultanță fiscală](https://www.bdo.ro/ro-ro/servicii/consultanta-fiscala), [Crowe — contabilitate](https://www.crowe.com/ro/services/contabilitate).
- Servicii suplimentare verificate la aceeași dată: [Crowe — salarizare](https://www.crowe.com/ro/services/salarizare), [BMLaw — asistență juridică](https://www.crowe.com/ro/services/bmlaw), [ENGIE — gaze](https://www.engie.ro/gaze-naturale/), [ENGIE — electricitate](https://www.engie.ro/electricitate/), [Pint.ro — rovinietă](https://pint.ro/rovinieta-online).
- La cererea utilizatorului, Crowe, ENGIE și Pint.ro au marcajul vizibil `★ Sponsorizat` și prioritate între firmele relevante. Configurarea pentru POC nu confirmă acorduri comerciale sau plăți. Interfața nu adaugă eticheta „demo”. Nu presupunem disponibilitate, onorarii sau rezultate.
- Resursele oficiale apar înaintea firmelor și nu primesc sponsorizare. Beneficiile, pensiile și impozitul auto trimit către instituția sau contactul relevant; contactele fără URL rămân text, fără link inventat. Salarizarea externă este indicată explicit pentru angajatori.
- Catalogul curent nu are o lege RCA/CASCO potrivită. Nu asociem asigurări private cu impozitul auto sau contribuțiile publice de sănătate; Pint.ro apare pentru serviciul său de rovinietă.
- Linkurile deschid un tab nou, cu `noopener noreferrer` și `no-referrer`, fără parametri de profil sau identificatori de urmărire.

Pipeline-ul LLM zilnic și mecanismul de comisioane din propunerea inițială nu sunt implementate în această schimbare. Varianta simplă de mai sus înlocuiește parcursul complex al machetei pentru acest increment.
