# Date personale: fluxurile verificate în cod

Verificat la 29 octombrie 2026. Andrei a cerut eliminarea promisiunii generale că nimic nu părăsește dispozitivul. Acest document descrie codul local inspectat, nu o verificare a infrastructurii sau a politicilor furnizorilor.

| Funcție | Unde ajung datele în implementarea curentă |
|---|---|
| Profil manual și plan | Etichetele, cifrele și acțiunile selectate sunt salvate în localStorage; potrivirea cu catalogul se face în browser. |
| Încărcare document | Fișierul original este trimis serverului aplicației, inclusiv în modul demo. |
| Analiză AI reală | Serverul trimite PDF-ul sau imaginea originală la Anthropic (Claude). Mascarea CNP/IBAN se aplică textului întors de model, nu fișierului înainte de trimitere. |
| Analiză demo | Serverul întoarce un răspuns pregătit; nu apelează Anthropic. |
| Conectare și plată | Autentificarea folosește Google; serverul transmite emailul contului către Stripe pentru asocierea abonamentului. Sesiunea aplicației folosește JWT în cookie. |
| Catalog Supabase | Sunt gestionate actele și ghidurile; în fluxul inspectat nu sunt stocate profiluri în Supabase. |

Surse în cod: [FormularProfil](../components/FormularProfil.tsx), [ruta de analiză](../app/api/analiza-document/route.ts), [mascare](../lib/anonimizare.ts), [profil](../lib/profil.ts), [plan](../lib/plan.ts), [autentificare](../auth.ts), [Stripe](../lib/stripe.ts).

## Ce putem spune

- Nu conectăm conturi bancare.
- Profilul salvat este în prezent păstrat în browser; aceasta nu este o garanție că toate datele sunt procesate exclusiv local.
- Înainte de încărcare explicăm destinațiile fișierului și absența mascării automate înainte de trimitere. Formularul manual rămâne alternativa.
- Ruta de analiză nu scrie explicit fișierul într-o bază de date sau pe disc. Aceasta nu dovedește absența păstrării la furnizor sau în infrastructură. Retenția la furnizori și conținutul posibil al logurilor de eroare necesită verificare separată.

## Ce eliminăm din comunicarea curentă

- „Nimic nu părăsește dispozitivul”, inclusiv folosirea „profilul rămâne pe telefon” drept promisiune generală de confidențialitate.
- „Identificatorii sunt eliminați înainte de orice apel la AI” sau „numele nu ajunge la AI”: nu sunt adevărate pentru documentele originale.
- „Nu păstrăm nimic nicăieri”: codul aplicației nu poate confirma singur retenția infrastructurii și a furnizorilor.

## Funcții discutate, încă neimplementate

Andrei a acceptat onboardingul vocal ElevenLabs opțional, limitat la profil, cu revizuirea și confirmarea etichetelor și formular manual echivalent. A acceptat și rezumatul lunar opt-in fără luni goale, plus o alertă distinctă pentru următoarea oportunitate. Preferințele se înregistrează separat de cont și recompensă, cu dezabonare simplă; fără trimitere duplicată implicită email/push. Aceste funcții nu sunt implementate în fluxurile inspectate. Deciziile complete sunt în [ADR 0004](adr/0004-recompense-teasere-notificari.md).

Vocea va necesita procesare externă și informare înainte de pornire, cu retenție configurată explicit. Contul gratuit cerut la revendicarea recompensei suplimentare va păstra acordarea și consumul deblocărilor, pentru a nu reacorda recompensa după ștergerea stocării locale. Nu cerem documente de identitate sau urmărire invazivă pentru această protecție.

Emailurile personalizate trimise când aplicația este închisă necesită o soluție pentru potrivire în fundal și preferințe de livrare; câmpurile minime sincronizate, retenția și implementarea ștergerii/dezabonării rămân de stabilit. Eliminarea promisiunii vechi nu implementează și nu autorizează implicit încărcarea tuturor profilurilor, documentelor sau înregistrărilor vocale pe server. Valorile exemplu nu sunt date personale confirmate și nu se scriu în profilul real.
