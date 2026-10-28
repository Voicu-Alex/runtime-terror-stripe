# Brief de design: aplicația v3

Pentru: instanța Claude care face designul ecranelor aplicației. Indică spre surse; nu le copia aici.

## Ce faci

Designul ecranelor aplicației, pornind de la mockup-ul v2, ca bază pentru prototipul real (Vite + React + TS, încă neînceput). Designul aprobat aici devine noul design de referință (`CLAUDE.md`, „Reguli”) și se notează ca ADR în `docs/adr/`.

## Citește întâi

1. `docs/produs.md`: produsul, audiența, deciziile v2.
2. `docs/design-research.md`: ce funcționează în fintech și în știri, sinteza „Anatomia unui card” și „De evitat”. E baza deciziilor vizuale; nu o contrazice fără motiv scris.
3. `mockup/index.html`: designul v2 (token-uri de culoare la începutul `<style>`, 12 reguli, 3 persone, tab-urile Noutăți / Planul meu / Profil, notificarea de deschidere). Capturile lui: `captures/v2-*.jpg`.
4. `docs/research-v2.md`: actele și sursele. Orice sumă sau act care apare pe ecran vine de aici.

## Ecranele

1. Notificarea (intrarea în aplicație).
2. Noutăți: fluxul cronologic, cardul de act închis și deschis (lei/lună, acțiune cu termen, „te privește ca: etichete”, link la articol, stare: proiect / adoptat / în vigoare / termen depășit).
3. Simularea unei acțiuni și bara „Planul meu” (12 luni, fără acțiuni și cu acțiuni, următorul termen).
4. Profil: etichetele pe familii, inclusiv „Domeniul meu”.
5. Onboarding: conversația cu asistentul care extrage etichetele, cu formularul ca alternativă. În v2 e doar un loc rezervat; aici se proiectează.
6. Stările goale, de încărcare și de eroare pentru fiecare ecran de mai sus.

## Constrângeri

- Telefon întâi (375px); desktopul e o coloană centrată.
- Sumele: `Intl.NumberFormat('ro-RO')`, cifre tabulare, semnul minus U+2212, unitatea și perioada mereu („−520 lei/lună”). Câștigul sau pierderea nu se arată doar prin culoare.
- Ce e simulat arată diferit de ce e sigur; „termen depășit” rămâne vizibil, estompat.
- Contrast text ≥ 4.5:1, ținte tactile ≥ 44px, `:focus-visible`, `prefers-reduced-motion`.
- Nu e sfat financiar; textele în română, cu diacritice. Personele din demo sunt fictive.

## Psihologie de conversie: FOMO, urgență, raritate (DotCom Secrets, Russell Brunson)

Le folosim ca motor principal al designului, dar **doar pe date reale**. Produsul are urgență adevărată (termenele din lege) și pierderi adevărate (lei/lună). Asta e mai convingător decât orice urgență fabricată și nu ne costă încrederea, care e baza produsului (`design-research.md`). Urgența sau raritatea falsă e și interzisă: Directiva 2005/29/CE privind practicile comerciale neloiale, Anexa I, interzice afirmația falsă că ceva e disponibil doar pentru un timp foarte limitat, făcută ca să obțină o decizie imediată.

| Concept | Cum îl aplicăm | Nu facem |
|---|---|---|
| **Hook, Story, Offer** (structura fiecărui mesaj) | Cârligul (hook) e titlul cardului cu suma („−520 lei/lună din ian 2027”). Povestea (story) e de ce te privește (etichetele și o frază pe înțelesul oricui). Oferta (offer) e acțiunea cu termen și butonul „Simulează”. La fel pentru notificare și pentru onboarding | Titluri-momeală fără sumă sau fără sursă |
| **FOMO** ca frică de a pierde bani | Formulat ca pierdere: „Dacă nu faci X până la <dată>, pierzi Y lei/an”. Cardurile de tip oportunitate (o deducere, un plafon care se resetează) arată banii lăsați pe masă. „Planul meu” pune alături „fără acțiuni” și „cu acțiuni” | Pierderi estimate prezentate ca sigure; FOMO pe ceva ce legea nu prevede |
| **Urgență** | Numărătoare „mai ai N zile” calculată din data din act; fluxul sortat după cel mai apropiat termen; o insignă de urgență doar sub un prag (de exemplu 30 de zile). „Termen depășit” rămâne vizibil, ca lecție | Cronometre care repornesc; urgență pe acte cu stare „proiect” (pot încă să se schimbe) |
| **Raritate** | Doar raritatea reală: ferestre legale care se închid, plafoane anuale care nu se reportează, cu sursa lângă ele | „Locuri limitate”, „doar azi”, stocuri inventate |
| **Social proof** | Doar cu cifre reale, cu sursă. Acum nu avem, deci nu apare | Utilizatori sau testimoniale inventate |
| **Attractive Character** | Vocea asistentului din onboarding: același ton, cald și direct, în toate mesajele | O persona care pretinde că e consultant financiar |
| **Value Ladder** | În afara scopului (fără plăți acum). Se poate marca locul unui nivel viitor, fără preț | Paywall pe impact sau pe termen |

Rămâne valabil: nu e sfat financiar. FOMO împinge spre o **acțiune pe care legea o permite**, nu spre un produs anume.

## Unelte

- **`ui-ux-pro-max` e obligatoriu la fiecare decizie vizuală**, din rădăcina repo-ului:
  1. Înainte de design: `python .claude/skills/ui-ux-pro-max/scripts/search.py "personal finance legal news mobile calm" --design-system -p "Ce inseamna pentru mine"`.
  2. Pe fiecare domeniu, cu `--domain`: `ux` (de ex. „notifications”, „forms”, „empty state”, „loading”), `typography`, `color`, `chart` (pentru „Planul meu”), `landing` („urgency scarcity” are tiparul cu disponibilitate verificată), `react` și `--stack react` (pentru prototipul care urmează).
  3. În comentariul din capul `mockup/v3/index.html`, notează pentru fiecare variantă ce interogări ai rulat, ce ai luat și ce ai respins, și de ce.
  4. Atenție: interogarea „fintech” îl duce pe profilul crypto (glassmorphism, dark, chihlimbar), adică exact ce `design-research.md` spune să evităm. Folosește „personal finance”, „news”, „government”, „legal”. Când ceva intră în conflict, câștigă `design-research.md` și regulile proiectului; spune explicit conflictul.
  5. La final, verifică fiecare ecran contra listei de reguli din `SKILL.md` (prioritățile 1-3: accesibilitate, atingere, performanță). Fără `--persist`.
- `prototype`, ramura UI: mai multe variante pe aceeași pagină, comutate prin `?v=a|b|c` și o bară jos.
- Server local: `python -m http.server 8765 --directory mockup`, apoi http://localhost:8765/v3/
- Capturi fără instalări, cu Chrome headless prin rama `mockup/frame.html`. Pe Windows, headless nu randează sub ~500px lățime, deci fără ramă telefonul iese tăiat. Exemplu (testat pe v2):
  `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --hide-scrollbars --window-size=375,812 --screenshot="<cale absolută>.png" "http://localhost:8765/frame.html?src=v3%2F%3Fv%3Da&w=375&h=812"`
  Pentru pagini lungi, mărește `h` și înălțimea ferestrei. Pentru desktop nu ai nevoie de ramă: `--window-size=1280,900` direct pe pagină. Uită-te la fiecare captură înainte să spui că un ecran e gata.

## Ce livrezi

- `mockup/v3/index.html`: un singur fișier, fără build, 2-3 variante comutabile. Variantele trebuie să fie cu adevărat diferite (ierarhie, densitate, tipografie), nu doar culori diferite. Cel puțin una pune urgența pe primul plan (termenul și pierderea sunt elementul dominant al ecranului), iar alta rămâne calmă, cu urgența doar pe cardurile sub prag. Așa putem compara cât FOMO suportă produsul fără să piardă încrederea.
- Capturi `captures/v3-<varianta>-<ecran>.png` la 375px, plus una la 1280px pentru fiecare variantă.
- În capul fișierului: un comentariu scurt pentru fiecare variantă (ce încearcă și ce sacrifică) și recomandarea ta.
- După ce omul alege: ADR în `docs/adr/` cu varianta aleasă și de ce, iar `.claude/session-state.md` actualizat.

Nu face commit sau push fără confirmarea omului.
