# Documente de test pentru `/documente`

Toate sunt **fictive**, generate cu un script (text randat ca imagine). Numele, CUI-ul, CNP-ul și IBAN-ul sunt inventate, dar au forma reală, ca să testăm și mascarea.

| Fișier | Ce e | Etichete așteptate | Valori așteptate | Ce mai verificăm |
|---|---|---|---|---|
| `contract-munca.pdf` | contract de muncă la o firmă de software (CAEN 6201), programator, 12.000 lei brut | `angajat`, `it` | `salariu_brut: 12000` | CNP-ul și IBAN-ul din document **nu** apar în răspuns (sau apar mascate `[CNP]`, `[IBAN]`) |
| `factura-gaz.pdf` | factură Engie, client casnic, gaze naturale, total 553,44 lei | `consumator_gaz` | `furnizor: Engie`, `suma_factura: 553.44` | nu propune `consumator_energie` (nu e factură de curent) |
| `fluturas-salariu.png` | fluturaș la o firmă de construcții (CAEN 4120), zidar, 6.500 brut, 3.802 net, Pilon II în CAS, Pilon III 100 lei | `angajat`, `constructii`, `pilon2`, `pilon3` | `salariu_brut: 6500`, `salariu_net: 3802` | `pilon2` poate veni cu încredere mai mică; e în regulă |

## Cum rulezi verificarea

1. Pune cheia în `.env.local` (`ANTHROPIC_API_KEY=...`).
2. `npm run dev` într-un terminal.
3. În altul: `node scripts/verifica-test-docs.mjs`. Trimite fiecare fișier la `/api/analiza-document` și compară cu tabelul de mai sus.

Stare la 2026-10-28: scriptul e scris, dar **nu a fost rulat** pe mașina lui Voicu, pentru că nu exista o cheie de API local. De rulat înainte de demo.
