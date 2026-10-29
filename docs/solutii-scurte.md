# Soluție scurtă în legea deschisă

29 octombrie 2026 — implementarea cerută după simplificarea conceptului de recomandări.

La deschiderea unei legi afișăm un paragraf „Ce poți face acum”, apoi „Poți discuta, de exemplu, cu:” și linkuri directe către site-urile consultanților. Fără pagină separată, modal, formular, checklist sau urmărire a cererilor. Layoutul rămâne minimal pentru revizuirea utilizatorului.

Implementat în `components/CardSchimbare.tsx` și `mockup/v6/index.html` (Pentru tine și Noutăți). În v6 se păstrează accesul existent la ghiduri; un teaser blocat nu afișează soluția. Proiectele și legile fără o asociere editorială nu primesc automat consultanți.

## Conținut și întreținere

- Sursa comună: `data/solutii.json`. Primele trei asocieri: dividende, microîntreprinderi, TVA.
- React: `lib/solutii.ts` și `components/SolutieScurta.tsx`.
- v6: `solutii.js` randează `solutii-date.js`, generat din JSON prin `node scripts/genereaza-solutii.mjs`. Generarea rulează și înainte de dev/build prin scriptul de publicare v6.
- Textele sunt sugestii scurte de pregătire a discuției, bazate pe ghidul și întrebările existente din catalog; nu adaugă sume sau termene legale.
- Site-uri și servicii verificate pe 29 octombrie 2026: [BDO — consultanță fiscală](https://www.bdo.ro/ro-ro/servicii/consultanta-fiscala), [Crowe — contabilitate](https://www.crowe.com/ro/services/contabilitate).
- Sunt exemple de prestatori, nu parteneriate confirmate. Nu presupunem disponibilitate, onorarii sau rezultate. Ambele înregistrări au `sponsorizat: false`.
- Randarea suportă marcajul `★ Sponsorizat` și poziționarea înaintea celorlalte exemple pentru o viitoare sponsorizare confirmată. Nu activa acel câmp fără acord comercial și decizia de produs aplicabilă.
- Linkurile deschid un tab nou, cu `noopener noreferrer` și `no-referrer`, fără parametri de profil sau identificatori de urmărire.

Pipeline-ul LLM zilnic și mecanismul de comisioane din propunerea inițială nu sunt implementate în această schimbare. Varianta simplă de mai sus înlocuiește parcursul complex al machetei pentru acest increment.
