# Documente de test pentru `/documente`

Toate sunt **fictive**, generate cu un script (text randat ca imagine). Numele, CUI-ul, CNP-ul și IBAN-ul sunt inventate, dar au forma reală, ca să testăm și mascarea.

| Fișier | Ce e | Etichete așteptate | Valori așteptate | Ce mai verificăm |
|---|---|---|---|---|
| `contract-munca.pdf` | contract de muncă la o firmă de software (CAEN 6201), programator, 12.000 lei brut | `angajat`, `it` | `salariu_brut: 12000` | CNP-ul și IBAN-ul din document **nu** apar în răspuns (sau apar mascate `[CNP]`, `[IBAN]`) |
| `factura-gaz.pdf` | factură Engie, client casnic, gaze naturale, total 553,44 lei | `consumator_gaz` | `furnizor: Engie`, `suma_factura: 553.44` | nu propune `consumator_energie` (nu e factură de curent) |
| `fluturas-salariu.png` | fluturaș la o firmă de construcții (CAEN 4120), zidar, 6.500 brut, 3.802 net, Pilon II în CAS, Pilon III 100 lei | `angajat`, `constructii`, `pilon2`, `pilon3` | `salariu_brut: 6500`, `salariu_net: 3802` | `pilon2` poate veni cu încredere mai mică; e în regulă |
| `cupon-pensie.png` | talon de pensie pentru limită de vârstă, 4.200 lei brut, născut în 1958 | `pensionar` | `pensie_lunara: 4200`, `an_nastere: 1958` | data completă a nașterii **nu** apare în răspuns, doar anul. În flux: CASS pe pensia peste 3.000 → −120 lei/lună |
| `factura-curent.pdf` | factură Hidroelectrica de energie electrică, client casnic, adresă la sat, total 302,74 lei | `consumator_energie`, `rural` | `furnizor: Hidroelectrica`, `suma_factura: 302.74` | nu propune `consumator_gaz` |
| `contract-inchiriere.pdf` | contract de închiriere pe 12 luni, chiriașa e studentă, chirie 2.000 lei | `chirias`, `elev_student` | `chirie_lunara: 2000` (nu intră în profil) | nu propune `proprietar` (persoana e chiriașul, nu proprietarul) |
| `hotarare-dividende.pdf` | hotărârea asociatului unic al unui SRL micro: 24.000 lei dividende din profitul 2025 | `srl_dividende`, `micro` | `dividende_anuale: 24000` | în flux: dividende 16% → −120 lei/lună |

### Documente noi (Andrei, 28 oct 2026, `eval/genereaza-documente.py`)

Doar pentru evaluarea modelelor (`docs/eval-modele.md`); modul demo nu are răspunsuri pregătite pentru ele.

| Fișier | Ce e | Etichete așteptate | Ce mai verificăm |
|---|---|---|---|
| `extras-cont.png` | extras de cont cu salariu, chirie, Engie | niciuna | extrasele nu se folosesc; IBAN-ul și CNP-ul nu apar |
| `factura-pfa-emisa.pdf` | factură emisă de o PFA de design | `pfa` | nu propune etichete de consumator; IBAN-ul nu apare |
| `extras-pilon2.png` | situația contului Pilon II | `pilon2` | CNP-ul nu apare |
| `bon-fiscal.png` | bon de supermarket | niciuna | |
| `fluturas-it-2026.png` | fluturaș IT, brut 10.000, net 6.500 | `angajat`, `it` | valorile exacte |
| `cupon-pensie-rotit.png` | talon de pensie rotit, contrast slab, 2.800 lei, născută în 1961 | `pensionar` | doar anul nașterii |

## Două moduri

- **Demo** (fără `ANTHROPIC_API_KEY`): ruta întoarce răspunsuri pregătite din `lib/demo-analiza.ts`, potrivite după numele fișierului. Merg doar aceste 7 fișiere. Răspunsul are `mod: "demo"` și UI-ul arată eticheta „Mod demo”.
- **Claude** (cu cheia în `.env.local`): aceeași rută trimite documentul la model. Merge orice document.

## Cum rulezi verificarea

1. `npm run dev` într-un terminal.
2. În altul: `node scripts/verifica-test-docs.mjs`. Trimite fiecare fișier la `/api/analiza-document` și compară cu tabelul de mai sus. Fără cheie testează modul demo; cu cheie, analiza reală.

Stare la 2026-10-28: modul demo verificat cu scriptul pe build-ul de producție (3 din 3 documente, etichetele și valorile așteptate). Modul Claude **nu a fost rulat încă** (nu există cheie); de rulat înainte să dezvoltăm mai departe.
