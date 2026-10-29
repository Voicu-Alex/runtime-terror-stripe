# Freemium: recompensă de profil, teasere și revenire la următoarea oportunitate

Data: 29 octombrie 2026. Status: acceptat de Andrei după interviul de clarificare și confirmarea Q10–Q13.

Completează [ADR 0003](0003-freemium-valoare-verificata.md). Regulile operaționale și cazurile de verificare sunt centralizate în [modelul de business](../../business/model-de-business.md).

## Decizii

1. **O oportunitate completă gratuită, plus o deblocare unică pentru profil complet.** Completarea înseamnă revizuirea categoriilor suportate și confirmarea profilului; „Nu se aplică” și „Prefer să nu spun” sunt valide. Formularul și vocea dau aceeași recompensă, inclusiv pentru profiluri completate anterior. Nu condiționăm recompensa de date inutile, microfon, documente, card sau acord pentru email.
2. **Cont gratuit la revendicarea recompensei suplimentare.** Vizitatorul poate naviga și completa profilul înainte de cont. Acordarea și consumul sunt păstrate per cont, fără a reatribui drepturi deja folosite la conectare. Acceptăm limitele protecției per cont; nu introducem verificarea actului de identitate sau urmărire invazivă.
3. **Credit păstrat dacă nu există altă oportunitate verificată.** Nu expiră artificial și nu promite o viitoare lege sau o dată. După finalizare/expirare, ghidurile deblocate rămân accesibile, fără credite noi automate.
4. **Verificarea eligibilității precedă dezvăluirea.** Creditul se consumă o singură dată când se deschide ghidul complet. „Nu mi se aplică” după deschidere nu restituie automat creditul; o eroare stabilită a regulii sau potrivirii noastre poate justifica restituirea. O alertă sau o verificare nereușită nu consumă credit.
5. **Teasere pentru celelalte ghiduri, fără estomparea întregului flux.** Categoria, etichetele, condițiile esențiale, sursa accesibilă, suma cu perioada și nivelul ei de certitudine rămân vizibile. Titlul detaliat și ghidul sunt ascunse. Statutul legii este separat de disponibilitatea acțiunii. Noutăți rămâne public; primul ghid deblocat rămâne integral.
6. **Exemple transparente pentru vizitatori și date lipsă.** Folosim profiluri exemplu numite, cu ipoteze și statistici verificate, nu valori „mediane” introduse în profilul real. Necunoscutele personale rămân necunoscute. Exemplele nu confirmă eligibilitatea, nu consumă credite și nu justifică Pro.
7. **Oportunități întreținute pe etichete.** Includem legi vechi cu beneficii încă disponibile; nu garantăm o recomandare fixă pentru fiecare etichetă. Paginile pentru termene închise arată starea reală și pot trimite către alte oportunități sau monitorizare.
8. **Stare goală sinceră.** Spunem că nu am găsit o oportunitate în catalogul verificat și păstrăm drepturile gratuite: „Următorul ghid complet e din partea noastră.” Putem arăta cea mai recent închisă oportunitate relevantă verificată drept exemplu pentru un profil similar. Nu afirmăm pierderi personale fără dovada eligibilității istorice; exemplul nu intră în economii și nu consumă credit.
9. **Voce ElevenLabs opțională, limitată la onboarding.** Conversație scurtă, extragere de etichete, revizuire și confirmare de către utilizator. Formularul manual rămâne echivalent. Sumele provin din motorul verificat. Informarea despre procesare externă precedă pornirea; retenția se configurează explicit.
10. **Rezumat lunar gratuit cu opt-in distinct și fără luni goale.** Contul sau completarea profilului nu abonează automat la email. Rezumatul conține informații utile și surse, nu doar teasing comercial. Păstrăm dovada alegerii și oferim dezabonare simplă.
11. **Alertă separată pentru următoarea oportunitate.** Gratuită, solicitată explicit, pe canalul ales; nu așteaptă digestul lunar. După livrare, cerem o alegere nouă pentru alerte continue. Fără dublare implicită email/push. Beneficiile cu aplicare largă intră numai după verificarea condițiilor. Informațiile insuficiente sau vechi cer reconfirmare, nu o promisiune de eligibilitate.
12. **Pro numai pentru valoarea suplimentară verificată.** Păstrăm prețul de referință de 15 lei/lună și pragul S12 ≥ C12 (180 lei pe 12 luni la acest tarif). Excludem toate drepturile gratuite, inclusiv recompensa câștigată, dar încă nerevendicată, și creditele neconsumate alocate candidaților în comparație. Două oportunități gratuite și nimic suplimentar înseamnă nicio ofertă Pro. Promovările prin email trebuie să respecte și scopul comunicării acceptate.

## Înlocuiește

- Cerința din ADR 0003 ca toate titlurile detaliate să fie vizibile: acum acestea pot fi ascunse în teaser, cu categorie și sursă accesibile.
- Limita inițială de o singură oportunitate gratuită: acum există și recompensa unică pentru completare.
- Orice interpretare a mesajului „Nu mi se aplică” ca restituire automată a creditului.
- Promisiunea generală de procesare exclusiv locală; [Date personale](../date-personale.md) separă fluxurile existente de cele viitoare.

## Limite și implementare

Aceasta este o decizie de produs, nu dovada implementării. Stocarea drepturilor pe cont este necesară pentru recompensă. Câmpurile minime de profil pentru potrivirea în fundal, retenția și ștergerea, infrastructura de livrare și setările ElevenLabs rămân de proiectat. Nu presupunem o aprobare pentru transferul tuturor documentelor/profilurilor pe server.

Politica opt-in este alegerea produsului; nu o prezentăm ca afirmație că toate situațiile juridice de comunicare au aceeași regulă. Nu se introduc un tarif anual, trial automat, WhatsApp sau un consultant vocal cu discuții nelimitate. Afilierea și comisioanele către specialiști rămân în afara modelului principal.
