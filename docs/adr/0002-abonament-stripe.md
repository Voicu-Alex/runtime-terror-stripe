# Pro: abonament lunar de 15 lei, prin Stripe, cu cont Google

**Actualizare, 29 octombrie 2026:** politica de acces și afișarea ofertei de mai jos sunt înlocuite de [ADR 0003: freemium și valoare verificată](0003-freemium-valoare-verificata.md). Prețul de referință rămâne 15 lei/lună. Detaliile de implementare de mai jos descriu decizia din 28 octombrie, nu confirmă implementarea freemium.

[ADR 0004](0004-recompense-teasere-notificari.md) adaugă un cont gratuit pentru revendicarea recompensei de profil, fără plată sau opt-in obligatoriu la email. Vechea descriere a autentificării numai pentru plată și fără bază de date nu acoperă încă evidența recompenselor și preferințelor viitoare.

Pe 28 oct 2026, echipa (Matei) a decis să adauge plata prin Stripe. Asta schimbă decizia din `CLAUDE.md` „fără Stripe în această etapă”. Aplicația rămâne fără integrări bancare.

## Ce s-a decis

- **Pro: abonament lunar de 15 lei**, plătit prin Stripe Checkout (mod `subscription`), reînnoit automat. Se anulează din portalul Stripe și rămâne activ până la finalul lunii plătite.
- **Accesul complet estompat (decizia inițială, înlocuită).** Acum se cere un plan gratuit permanent cu previzualizări și o oportunitate completă. Vezi ADR 0003.
- **Promovarea necondiționată în antet (înlocuită).** Oferta „Upgrade la Pro” este condiționată de valoarea suplimentară verificată, conform ADR 0003; accesul la gestionarea unui abonament existent rămâne disponibil.
- **Conectarea cu Google e obligatorie înainte de plată** (Auth.js v5, `auth.ts`). Abonamentul se leagă de emailul contului Google prin clientul Stripe, deci te urmează pe orice telefon. Sesiunea folosește JWT în cookie. Aceasta nu înseamnă că toate datele rămân pe dispozitiv: vezi [fluxurile de date verificate la 29 octombrie](../date-personale.md).
- **Fără bază de date:** starea Pro o citește serverul de la Stripe la fiecare verificare (clientul după email, apoi abonamentele lui), deci anulările și plățile eșuate se văd imediat.
- **Webhook cu semnătura verificată** (`/api/stripe/webhook`) pentru evenimentele de abonament și de risc. Acum doar le jurnalizează: accesul nu depinde de el.
- **TVA:** contul Stripe are **Managed Payments** activat implicit: Stripe e vânzătorul înregistrat și calculează, încasează și plătește TVA-ul. De aceea produsul are codul fiscal `txcd_10701401` („Website Information Services - Personal Use”).
- Cheile stau doar în `.env.local` (`.env.example` le enumeră). E de preferat o cheie Stripe restricționată (`rk_…`).

## Ce nu e încă rezolvat

- **Sumele estompate sunt în pagină.** Calculul rulează pe dispozitiv, din catalogul public, deci cine inspectează pagina le poate citi. Pentru demo e acceptabil; o barieră reală ar cere calculul pe server.
- **Webhook-ul nu scrie nicăieri.** Înainte de lansare are nevoie de o bază de date (remindere, emailuri, evidență contabilă).
- **Prețul și accesul.** 15 lei/lună rămâne prețul de referință. Propunerea anterioară de 49,99 lei/lună sau 299 lei/an, cu prima lună gratuită, este înlocuită de freemium; vezi [modelul de business](../../business/model-de-business.md). Perioada de probă nu e activă.
- **Încadrarea fiscală** (`txcd_10701401`) trebuie confirmată cu un contabil înainte de modul live; fără Managed Payments, ar trebui Stripe Tax și o înregistrare fiscală proprie.
- **Google OAuth** cere un client creat în Google Cloud (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`), cu adresele de redirect pentru localhost și pentru domeniul de pe Vercel.
