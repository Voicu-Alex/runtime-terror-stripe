# Pro: abonament lunar de 15 lei, prin Stripe, cu cont Google

Pe 28 oct 2026, echipa (Matei) a decis să adauge plata prin Stripe. Asta schimbă decizia din `CLAUDE.md` „fără Stripe în această etapă”. Aplicația rămâne fără integrări bancare.

## Ce s-a decis

- **Pro: abonament lunar de 15 lei**, plătit prin Stripe Checkout (mod `subscription`), reînnoit automat. Se anulează din portalul Stripe și rămâne activ până la finalul lunii plătite.
- **Fără Pro, fluxul pe profilul tău se vede estompat**, cu „Upgrade la Pro” deasupra (arată câte legi te privesc). Cu Pro vezi suma pe profilul tău, termenele, pașii și „Planul meu”. Exemplele fictive (`/flux?p=…`), pagina „Toate legile” și landing-ul rămân deschise, ca demonstrație.
- **Butonul „Upgrade la Pro” în antet**; după plată devine o insignă „Pro ✓”.
- **Conectarea cu Google e obligatorie înainte de plată** (Auth.js v5, `auth.ts`). Abonamentul se leagă de emailul contului Google prin clientul Stripe, deci te urmează pe orice telefon. Profilul rămâne doar pe dispozitiv; pe server nu ținem nimic (sesiunea e un JWT în cookie).
- **Fără bază de date:** starea Pro o citește serverul de la Stripe la fiecare verificare (clientul după email, apoi abonamentele lui), deci anulările și plățile eșuate se văd imediat.
- **Webhook cu semnătura verificată** (`/api/stripe/webhook`) pentru evenimentele de abonament și de risc. Acum doar le jurnalizează: accesul nu depinde de el.
- **TVA:** contul Stripe are **Managed Payments** activat implicit: Stripe e vânzătorul înregistrat și calculează, încasează și plătește TVA-ul. De aceea produsul are codul fiscal `txcd_10701401` („Website Information Services - Personal Use”).
- Cheile stau doar în `.env.local` (`.env.example` le enumeră). E de preferat o cheie Stripe restricționată (`rk_…`).

## Ce nu e încă rezolvat

- **Sumele estompate sunt în pagină.** Calculul rulează pe dispozitiv, din catalogul public, deci cine inspectează pagina le poate citi. Pentru demo e acceptabil; o barieră reală ar cere calculul pe server.
- **Webhook-ul nu scrie nicăieri.** Înainte de lansare are nevoie de o bază de date (remindere, emailuri, evidență contabilă).
- **Prețul.** `business/monetizare.md` (Chris) propune 49,99 lei/lună sau 299 lei/an, cu prima lună gratuită. 15 lei e prețul ales acum; perioada de probă nu e activă.
- **Încadrarea fiscală** (`txcd_10701401`) trebuie confirmată cu un contabil înainte de modul live; fără Managed Payments, ar trebui Stripe Tax și o înregistrare fiscală proprie.
- **Google OAuth** cere un client creat în Google Cloud (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`), cu adresele de redirect pentru localhost și pentru domeniul de pe Vercel.
