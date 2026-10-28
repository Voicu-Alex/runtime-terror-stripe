# Abonament lunar de 15 lei, prin Stripe

Pe 28 oct 2026, echipa (Matei) a decis să adauge plata prin Stripe. Asta schimbă decizia din `CLAUDE.md` „fără Stripe în această etapă”. Aplicația rămâne fără integrări bancare.

## Ce s-a decis

- **Abonament lunar de 15 lei**, plătit prin Stripe Checkout (mod `subscription`), reînnoit automat. Se anulează din portalul Stripe și rămâne activ până la finalul lunii plătite.
- **Fără abonament** vezi actele care te privesc, termenele și pagina „Toate legile”. **Cu abonament** vezi și suma pe profilul tău (lei/lună), cât păstrezi dacă faci ce permite legea și „Planul meu”. Exemplele fictive (`/flux?p=…`) și pagina „Toate legile” rămân cu sume, ca demonstrație.
- **Fără conturi și fără bază de date.** Pe dispozitiv ținem doar ID-ul abonamentului (`sub_…`). Starea o citește serverul de la Stripe la fiecare verificare, deci anulările și plățile eșuate se văd imediat.
- **Webhook cu semnătura verificată** (`/api/stripe/webhook`) pentru evenimentele de abonament și de risc. Acum doar le jurnalizează: accesul nu depinde de el.
- Cheile stau doar în `.env.local`. E de preferat o cheie restricționată (`rk_…`).

## Ce nu e încă rezolvat

- **ID-ul abonamentului e singura dovadă de pe dispozitiv.** Cine îl copiază pe alt telefon are și acolo acces. E acceptabil pentru demo; înainte de lansare trebuie un cont (email) legat de clientul Stripe.
- **Webhook-ul nu scrie nicăieri.** Înainte de lansare are nevoie de o bază de date (remindere, emailuri, evidență contabilă).
- **Prețul.** `business/monetizare.md` (Chris) propune 49,99 lei/lună sau 299 lei/an, cu prima lună gratuită. 15 lei e prețul ales acum; perioada de probă nu e activă.
- **TVA.** Contul Stripe are **Managed Payments** activat implicit: Stripe e vânzătorul înregistrat și calculează, încasează și plătește TVA-ul. De aceea produsul are codul fiscal `txcd_10701401` („Website Information Services - Personal Use”). Încadrarea trebuie confirmată cu un contabil înainte de modul live; fără Managed Payments, ar trebui Stripe Tax și o înregistrare fiscală proprie.
