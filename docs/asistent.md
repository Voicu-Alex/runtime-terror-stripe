# Asistentul: profil prin conversație și întrebări despre o lege

Scris la 29 octombrie 2026, pe branch-ul `feat/asistent`. Pune în aplicație decizia din `docs/produs.md`: profilul se face vorbind cu un asistent, cu formularul ca alternativă.

## Regula care îl face să încapă în produs

Prima regulă a aplicației este „nimic inventat”, iar orice sumă vine din motor. Un chat inventează din fire. De aceea modelul face exact două lucruri:

1. **Text liber → etichete** din lista fixă din `lib/taguri.ts`, printr-o schemă JSON cu enum. Nu poate produce o etichetă care nu există.
2. **Explică un singur card** din ce există deja pentru el: intrarea din `data/catalog.json`, ghidul din `data/ghid.json`, nivelurile zero/curios/expert și potrivirea calculată de `lib/potrivire.ts`. Sumele, datele și articolele îi sunt date ca date; promptul îi interzice să calculeze.

Tot restul rămâne determinist: potrivirea, lei/lună, termenele, fluxul.

## Ce face

- **Pe `/profil`**: cele 6 întrebări din `content/parcurs.md` §2, una pe familie de etichete, cu răspunsuri rapide și „Sar peste”. Butoanele nu apelează niciun model. Textul scris liber pleacă la `/api/asistent` (mod `profil`) și se întoarce ca etichete cu cuvântul din care au venit („IT din «programator»”), afișate ca chips cu ×. La final: „Am găsit N acte care te privesc” și „Vezi ce te privește” → `/flux`. „Prefer formularul” rămâne mereu la vedere și arată `FormularProfil`. `/profil?p=andrei` arată conversația deja completată pentru o persoană din demo.
- **Pe un card** (`CardSchimbare`): butonul „Întreabă” deschide aceeași casetă în mod `lege`, cu trei întrebări sugerate („De ce mă privește?”, „Ce trebuie să fac?”, „Ce se întâmplă dacă nu fac nimic?”). Fiecare răspuns se încheie cu actul și articolul, cu link la sursă, sau cu „încă nu am verificat”.
- **Refuză**: sume, date sau articole care nu sunt în datele primite; recomandări de produse sau investiții; întrebări din afara aplicației (declarația unică → anaf.ro); CNP, IBAN, nume, venitul exact.

## Cum e făcut

| Fișier | Rol |
|---|---|
| `lib/asistent.ts` | Cele 6 întrebări (textele din parcurs.md), mașina de stări a conversației, regula de sărit pasul 3 și întrebările deja răspunse în cuvintele omului, tipurile cererii și răspunsului API, validarea `esteCerere`, `redaDinTaguri` pentru demo |
| `lib/demo-asistent.ts` | Modul fără cheie: cuvinte-cheie → etichete; răspunsuri despre o lege numai din niveluri, ghid și acțiuni |
| `lib/asistent-prompt.ts` | Promptul de sistem (blocul din `docs/voce.md` §9 și exemplele §7) și blocul DATE pentru un card |
| `app/api/asistent/route.ts` | POST, două moduri. Fără `ANTHROPIC_API_KEY` sau la orice eroare: demo. `profil` → `claude-haiku-5-5` cu schemă JSON (enum de etichete); `lege` → `claude-sonnet-5-5`, text. Nu stochează și nu loghează conținut. |
| `components/Asistent.tsx` | Caseta de chat, în stilul v3 F, RO/EN, pe `/profil` și în `<dialog>` pe card |

Modelele sunt cele recomandate în `docs/eval-modele.md` (Haiku pentru etichete, Sonnet pentru interpretare). Ruta de documente rămâne pe Opus; decizia pe modele e a echipei.

## Date personale

Răspunsurile rapide nu părăsesc browserul. Textul scris liber și, la întrebările despre o lege, etichetele și cifrele din profil plus istoricul conversației ajung la serverul aplicației; cu cheie configurată, serverul le trimite la Anthropic. Fără cheie, nimic nu pleacă la Anthropic. Rândul corespunzător trebuie adăugat în `docs/date-personale.md` (fișierul nu e încă pe `main`).

## Ce rămâne deschis

- Dacă întrebările despre o lege devin partea de Pro. Azi Pro nu deblochează nimic; decizie de echipă.
- „Nu știu ce e Pilonul II” din parcurs.md lipsește: explicația cere sursa ASF.
- Ruta cu cheie reală nu a fost rulată în această ramură; testele nu ating rețeaua.
- `docs/voce.md` §11 spune „nu adaugă un chat liber”; de actualizat când fișierul ajunge pe `main`.
