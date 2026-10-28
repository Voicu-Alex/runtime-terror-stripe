# Conturi cu email și parolă, pe lângă Google

Pe 28 oct 2026, echipa (Matei) a decis ca, pe lângă Google, să existe și un cont al aplicației, cu email și parolă. Sign in with Apple nu intră acum: cere un cont Apple Developer plătit și un domeniu https înregistrat (nu merge pe localhost).

## Ce s-a decis

- **Conectarea** se face pe `/cont`: „Continuă cu Google” sau email și parolă, cu „Creează cont” și „Ai uitat parola?”. Pagina Pro (`/abonament`) folosește aceeași componentă la pasul 1.
- **Contul cu email se folosește doar după confirmarea emailului.** Abonamentul Pro se găsește la Stripe după email (ADR 0002); fără confirmare, cineva și-ar face cont pe emailul altcuiva și i-ar folosi abonamentul.
- **O bază de date Postgres cu o singură tabelă**, `conturi` (email, parola criptată, confirmat). Tabela se creează singură la prima folosire. Profilul rămâne pe dispozitiv; abonamentul rămâne la Stripe.
- **Parolele** sunt criptate cu scrypt (din Node, cu sare aleatoare), minim 8 caractere.
- **Linkurile din emailuri** (confirmare 24 h, resetare 30 min) sunt semnate cu `AUTH_SECRET` și nu au tabel. Linkul de resetare poartă amprenta parolei curente, deci merge o singură dată.
- **Răspunsuri care nu dezvăluie conturile:** „emailul sau parola nu sunt corecte”, iar crearea unui cont pe un email existent trimite pe email un link de resetare, nu o eroare.
- **Emailurile** pleacă prin Resend. Fără `RESEND_API_KEY`, în dezvoltare linkul se scrie în consola serverului; în producție, fără cheie, trimiterea eșuează.

## Ce nu e încă rezolvat

- **Limitarea încercărilor** (rate limiting) la conectare și la cererile de email lipsește; înainte de lansare trebuie adăugată.
- **Domeniul de email:** până la un domeniu verificat în Resend, adresa de test `onboarding@resend.dev` trimite doar spre adresa contului Resend. Pentru alți destinatari: un domeniu verificat și `EMAIL_DE_LA`.
- **Ștergerea contului** (GDPR) nu are încă un buton; se face manual în baza de date.
- **Apple:** codul se poate adăuga oricând (provider Apple în `auth.ts`), după contul Apple Developer.
