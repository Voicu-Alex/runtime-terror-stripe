# Asistentul în Buzunar

Chatul se deschide din Profil, din bula de pe Pentru tine / Toate legile / flux sau din butonul unui act din catalog. Folosește culorile, fonturile și controalele existente. Formularul de profil, Planul meu, navigarea și pagina Pentru tine rămân cele din main.

Răspunsurile explică legi din catalog și termenii verificați în `data/termeni-asistent.json`. „Explică mai simplu” păstrează subiectul și reformulează. Sursele și data verificării sunt separate de explicație. Condițiile și excepțiile legii rămân în răspuns; modelul nu trebuie să inventeze exemple numerice.

Etichetele propuse sunt aplicate numai după Confirmă. Formularul și Planul meu urmăresc același profil, inclusiv când chatul îl modifică. Conversațiile demo sunt separate de cea personală; exemplul Andrei implicit de pe homepage este identificat ca demo. Chatul păstrează conversațiile și modificările demo numai în memoria paginii. Profilul personal folosește stocarea locală existentă.

`POST /api/asistent` acceptă doar contractul `mod: "chat"`, cu mesaj, istoric limitat, profil și context opțional. Nu scrie conversația în loguri sau în baza de date. Fără `ANTHROPIC_API_KEY`, răspunde din catalog. Cu cheie, modelul poate reformula numai dovezile selectate; numerele sau URL-urile noi declanșează revenirea la textul verificat. Acest filtru nu dovedește corectitudinea semantică a fiecărei reformulări, de aceea răspunsul AI este etichetat și păstrează sursele.

Apelurile plătite folosesc contorul existent din `lib/limita.ts`, separat pentru chat: `LIMITA_ASISTENT_PE_ORA` (implicit 20 pe adresă) și `LIMITA_ASISTENT_PE_ZI` (implicit 150). Limita este în memoria instanței, nu un plafon distribuit. La atingerea ei, chatul continuă cu răspunsurile din catalog. `0` dezactivează apelurile plătite pentru intervalul respectiv.

Verificare: `npm test`, `npm run build`; manual, explicație + reformulare, confirmarea unei etichete și actualizarea formularului/Planului meu, Escape cu revenirea focusului, demo Andrei și dialog pe telefon. Furnizorul AI este simulat în teste; verificarea vizuală folosește modul fără cheie.
