# Design v3: varianta „Revistă”, pe gri

Pe 28 oct 2026, echipa (Matei) a ales ca design de referință pentru prototip varianta F din `mockup/v3/index.html` (`?v=f`). Asta înlocuiește `mockup/index.html` (v2), care era referința până acum (`CLAUDE.md`, „Reguli”). Layout-ul e cel al unei publicații pentru publicul larg, după tiparul avocatnet.ro (`docs/research-competitori.md`), cu brandul și textele noastre. Accentul e gri cald, așa că singurele culori puternice de pe ecran sunt verdele (bani în plus) și roșul (bani în minus).

## Ce s-a decis

- **Titlurile spun totul din prima**, cu valoarea de dinainte acolo unde e confirmată de sursă („TVA a crescut de la 19% la 21%, cota redusă de la 9% la 11%”). Unde valoarea veche nu e confirmată în textul legii, nu se scrie (vezi HoReCa în `docs/research-v2.md`).
- **Bani:** verde pentru plus, roșu pentru minus, gri pentru 0. Fără casete „estimare” și fără „≈” în flux. Când suma e calculată de noi, cardul deschis spune: „Suma e calculul nostru pe profilul tău, nu o cifră scrisă în lege”.
- **Termenul e mare:** „mai ai N zile” la 22px în articolul principal și pe un rând separat, aldin, în listă. Termenele sub 30 de zile sunt roșii, cu eticheta „urgent”.
- **Tipografie:** Raleway 800 pentru titluri, Inter pentru text și sume. Fără serif în textul explicativ.
- **Culori:** text #111827, accent #57534E (7,6:1 pe alb), logo #44403C; degradeuri spre gri (#DEDBD8 → #F1F0EE → alb).
- **Structura:** antet centrat cu slogan, navigare cu majuscule, filtre pe familii de etichete, articolul principal (următorul termen), blocul „pentru tine, în cifre”, coloana „Termene · ce urmează” cu data mare, lista fără numerotare. Pe telefon: bara de filtru, articolul, cifrele, termenele, lista.

## Variante respinse

A (termenul întâi), B (calm editorial), C (planul întâi), D (revistă, albastru regal), E (revistă, turcoaz). Rămân în fișier pentru comparație. Turcoazul era prea aproape de verdele folosit pentru bani.

## Ce nu e încă decis

- Ascunderea marcajului „estimare” din listă: cine citește doar lista nu vede care sume sunt calculate de noi (de exemplu −520 lei/lună la IT, calculat pentru un brut de 8.000 lei).
- Ecranele Planul meu, Profil și onboarding din varianta F au antetul nou, dar conținutul e încă cel din varianta B.
