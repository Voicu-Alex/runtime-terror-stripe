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

## Pe Vercel (doar Voicu poate)

1. **Doar Voicu dă merge spre `main`.** Vercel (Hobby, repo privat) publică doar commit-urile al căror autor are acces la proiect. Merge-ul lui Matei pe PR #31 (`bbf6c74`) a fost blocat, așa că live rulează încă `1f2978f`.
2. **`PRO_DESCHIS_DEMO=1`** în Environment Variables, pe durata jurizării. Fără el, după PR #31 juriul vede fluxul estompat și un buton de plată.
3. **Cheia Anthropic a colegului:** `ANTHROPIC_API_KEY`. Analiza documentelor are o frână (`LIMITA_DOCUMENTE_PE_ORA`, implicit 5 pe adresă, și `LIMITA_DOCUMENTE_PE_ZI`, implicit 150), dar ea e pe instanță, nu globală. Pentru o limită fermă, setați și un buget lunar în consola Anthropic.
4. Dacă juriul trebuie să se poată conecta cu Google, aplicația OAuth trebuie scoasă din modul „Testing” sau juriul adăugat ca testeri.

## De decis înainte de filmare

- **Prețul Pro.** Aplicația și ADR 0002 spun 15 lei/lună, iar `business/slide-cum-facem-bani.md` spune 299 lei/an sau 49,99 lei/lună, cu prima lună gratuită. Video-ul, slide-ul și aplicația trebuie să spună același lucru.
- **Scutirea IT.** Aplicația arată −520 lei/lună pentru Andrei (brut 8.000, doar impozitul). Materialele mai vechi spun −650. Scenariul folosește 520.
- **Numele în engleză.** Brandul rămâne „Ce înseamnă pentru mine”. În video îl traducem o dată: *“what it means for me”*.
- **Onboarding-ul prin chat** din `CLAUDE.md` nu există în aplicație. Echipa a ales profilul din documente. Ori actualizăm `CLAUDE.md`, ori nu-l promitem în pitch.

## Despre brag (video generat din cod)

Nu e potrivit pentru video-ul principal: juriul cere un „credible product experience”, adică aplicația reală, filmată, cu voce. E bun pentru o deschidere sau un final de 10–15 secunde, rulat **după** ce aplicația e gata, pentru că citește codul. Verificați fiecare cifră care apare în el: regula „nimic inventat” se aplică și acolo.

## Engleza

În engleză (`?lang=en`) nu mai rămâne nimic în română în afară de numele aplicației, nume proprii și citatele din lege din `/admin`, care au dedesubt traducerea neoficială. Traducerile textelor din date stau în `data/traduceri-en.json`, separat de catalog: cine schimbă textul românesc actualizează și traducerea, iar `lib/traduceri.test.ts` pică dacă structura nu se mai potrivește.

## Ce n-a apucat să intre (dacă e timp)

- Etichetele fără niciun act în catalog: `chirias`, `rural`, `sanatate`, `intretin_handicap`. Cine le bifează vede mai puțin. Plus eticheta „investitor”, care lipsește. Amândouă cer cercetare cu surse verificate, nu traducere.
