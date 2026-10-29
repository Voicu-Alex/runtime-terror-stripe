# Pitch: ce e gata și ce mai e de făcut

*29 oct 2026, Chris (cu Claude), branch `chris-demo`, PR #34. Pentru sesiunile Claude de mâine: citiți întâi fișierul ăsta.*

Prima fază e un **video de pitch de maximum 3 minute, în engleză**. Juriul îl notează pe criteriile din `docs/rethinking_financial_futures_hackathon_stripe.pdf` (p. 5) și poate deschide linkul în timp ce se uită. Linkul apare și în slide-uri, iar după video s-ar putea să prezentăm live.

## Fișierele

| Fișier | Ce e |
|---|---|
| `scenariu-video.md` | Scenariul de 3 minute: minutaj, ce e pe ecran, voiceover și text pe ecran, plus ce trebuie verificat înainte de filmare |
| `slides.md` | Structura recomandată pentru slide-uri, texte-exemplu și direcția vizuală (nu modifică prezentarea în lucru) |
| `intrebari-juriu.md` | Întrebările probabile ale juriului, cu răspunsuri scurte în engleză și sursa fiecăruia |
| `../../scripts/inregistreaza-demo.mjs` | Filmează automat cele 7 scene în `captures/video/` |

## Demo-ul în aplicație (după merge-ul PR #34)

| Unde | Ce arată |
|---|---|
| `/?lang=en` | Landing-ul în engleză. `?lang=en` pe orice pagină pornește engleza |
| `/profil` | Profilul din document. Fără cheie API, merg doar documentele din `test-docs/` (mod demo) |
| `/flux?p=andrei` (sau `maria`, `ion`, `ioana`, `elena`) | Fluxul unei persoane fictive, cu sume în lei |
| `/admin` | Inbox-ul din Monitorul Oficial, cu propunerile reale Sonnet 5.5 și „Approve and publish”. Deschideți `/flux?p=elena` în alt tab: cardul apare fără reload. „Withdraw” anulează aprobarea pentru încă o filmare |
| `/surse` | Surse, ipoteze, AI, date personale, reglementare, limitări |
| `/abonament` | Pro prin Stripe |

## Decis pe 29 oct (Chris și Andrei)

- **Linkul pentru juriu e site-ul lui Andrei, https://descriere.andreidobrin.com.** Serverul lui publică automat tot ce intră în `main` (`deploy/descriere/README.md`), deci nu mai depindem de Vercel. Secretele sunt în `/etc/descriere-app/.env.local` pe serverul lui.
- **Supabase: proiectul lui Andrei** (`docs/supabase.md`). Cine rulează scripturile pune în `.env.local` cheile acelui proiect. Proiectul vechi al lui Chris nu se mai folosește.
- **Macheta v6 („Pentru tine” + „Noutăți”), cu freemium (ADR 0003, 0004), e direcția principală.** Azi e o pagină statică, doar în română, la `/v6`; aplicația Next.js are încă designul v3.
- **`/admin` cu pipeline-ul lui Andrei:** `npm run legi:export-inbox` scrie propunerile din Supabase în `data/inbox-mo.json`, pe care `/admin` îl afișează. Actele exportate n-au traducere în engleză.

## Pe serverul de deploy (Andrei)

1. **`PRO_DESCHIS_DEMO=1`** pe durata jurizării. Fără el, juriul vede fluxul estompat și un buton de plată.
2. **Cheia Anthropic:** `ANTHROPIC_API_KEY` (pe serverul lui e deja configurată). Analiza documentelor are o frână (`LIMITA_DOCUMENTE_PE_ORA`, implicit 5 pe adresă, și `LIMITA_DOCUMENTE_PE_ZI`, implicit 150), dar ea e pe instanță, nu globală. Pentru o limită fermă, setați și un buget lunar în consola Anthropic.
3. Dacă juriul trebuie să se poată conecta cu Google, aplicația OAuth trebuie scoasă din modul „Testing” sau juriul adăugat ca testeri.

## De decis înainte de filmare

- **Prețul Pro.** Aplicația și ADR 0002 spun 15 lei/lună, iar `business/slide-cum-facem-bani.md` spune 299 lei/an sau 49,99 lei/lună, cu prima lună gratuită. Video-ul, slide-ul și aplicația trebuie să spună același lucru.
- **Scutirea IT.** Aplicația arată −6.240 lei/an pentru Andrei (520 lei/lună × 12; brut 8.000, doar impozitul). Materialele mai vechi spun −650 pe lună. Scenariul folosește 6.240 pe an.
- **Numele în engleză.** Brandul rămâne „Ce înseamnă pentru mine”. În video îl traducem o dată: *“what it means for me”*.
- **Onboarding-ul prin chat** din `CLAUDE.md` nu există în aplicație. Echipa a ales profilul din documente. Ori actualizăm `CLAUDE.md`, ori nu-l promitem în pitch.

## Despre brag (video generat din cod)

Nu e potrivit pentru video-ul principal: juriul cere un „credible product experience”, adică aplicația reală, filmată, cu voce. E bun pentru o deschidere sau un final de 10–15 secunde, rulat **după** ce aplicația e gata, pentru că citește codul. Verificați fiecare cifră care apare în el: regula „nimic inventat” se aplică și acolo.

## Engleza

În engleză (`?lang=en`) nu mai rămâne nimic în română în afară de numele aplicației, nume proprii și citatele din lege din `/admin`, care au dedesubt traducerea neoficială. Traducerile textelor din date stau în `data/traduceri-en.json`, separat de catalog: cine schimbă textul românesc actualizează și traducerea, iar `lib/traduceri.test.ts` pică dacă structura nu se mai potrivește.

## Ce n-a apucat să intre (dacă e timp)

- Etichetele fără niciun act în catalog: `chirias`, `rural`, `sanatate`, `intretin_handicap`. Cine le bifează vede mai puțin. Plus eticheta „investitor”, care lipsește. Amândouă cer cercetare cu surse verificate, nu traducere.
