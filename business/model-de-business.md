# Modelul de business: „Ce înseamnă pentru mine”

*Actualizat la 29 octombrie 2026, cu toate deciziile confirmate de Andrei în discuția despre monetizare: freemium, o oportunitate gratuită plus o deblocare pentru completarea profilului, teasere verificabile, onboarding vocal opțional și comunicări alese explicit. Vezi [ADR 0003](../docs/adr/0003-freemium-valoare-verificata.md) și completarea sa, [ADR 0004](../docs/adr/0004-recompense-teasere-notificari.md). Acest document înlocuiește propunerile anterioare din `business/monetizare.md`. Regulile descriu comportamentul țintă, nu confirmă implementarea. Cercetarea istorică rămâne în `business/bibliografie.md`; ipotezele și cifrele neverificate sunt marcate explicit.*

## Pe scurt

1. **Freemium permanent + Pro la 15 lei/lună**, prețul de referință din ADR 0002. Fără probă automată; nu este stabilit un tarif anual.
2. **O oportunitate completă gratuită + încă o deblocare pentru profil complet.** Recompensa este unică, se revendică printr-un cont gratuit și nu cere acord pentru email. Celelalte ghiduri au teasere. Propunem Pro numai când economiile suplimentare verificate, excluzând toate oportunitățile accesibile gratuit, acoperă costul pe aceeași perioadă.
3. **Revenire prin utilitate:** rezumat lunar gratuit, cu opt-in și fără luni goale; separat, alertă gratuită pentru următoarea oportunitate, la cerere. Pro adaugă monitorizarea planului și remindere detaliate. Vocea ElevenLabs este opțională și limitată la onboarding; formularul manual este echivalent. WhatsApp rămâne o extensie neaprobată pentru implementare.
4. **Afilierea nu e o sursă de venit în pitch.** Aplicația arată întâi comparatorul oficial ANRE, apoi furnizorii în ordine alfabetică. Eticheta „partener” apare doar unde există program de afiliere. În 2Performant nu există, în octombrie 2026, nicio categorie de energie sau bănci.
5. **Specialiștii nu sunt o sursă de venit.** Butonul trimite gratuit la registrul public al profesiei, iar aplicația spune „Nu primim bani de la specialiști” (`business/profesionisti.md`).
6. **Fără reclame și fără vânzare de date.** Explicăm procesarea externă înainte de folosirea AI; documentele originale nu sunt mascate automat înainte de trimitere. Vezi [fluxurile de date verificate](../docs/date-personale.md).

## 1. Planul gratuit și Pro

### Preț și acces

Pro are prețul de referință de **15 lei/lună**, cu reînnoire lunară și anulare conform [ADR 0002](../docs/adr/0002-abonament-stripe.md). **180 lei reprezintă calculul pentru 12 luni la acest tarif, nu un plan anual sau un angajament minim.** Planul gratuit nu expiră și nu cere card. Oferta anterioară cu prima lună gratuită și tarifele de 49,99 lei/lună sau 299 lei/an este înlocuită.

| Experiență | Gratuit | Pro |
|---|---|---|
| Noutăți | Rezumate, statut, date și surse oficiale | Aceleași informații |
| Profil | Formular manual sau conversație vocală opțională; aceeași recompensă | Același profil |
| Pentru tine | Oportunitățile deblocate și teaserele celorlalte; exemplele pentru vizitatori sunt marcate separat | Calcule detaliate pentru toate schimbările relevante |
| Ce poți face | O oportunitate completă, plus o deblocare unică pentru profil complet, revendicată cu un cont gratuit | Toate ghidurile personalizate și simulările |
| Celelalte oportunități | Categorie, etichete, sursă, condiții esențiale, sumă și perioadă, statutul legii și disponibilitatea acțiunii; titlul detaliat și ghidul sunt ascunse | Titlul detaliat, explicația completă și calculul personalizat detaliat |
| Planul meu | Previzualizare și acces la ghidurile deblocate gratuit | Acțiuni salvate, scenarii compatibile, impact combinat și remindere |
| Monitorizare | Rezumat lunar opt-in și, separat, o alertă la cerere pentru următoarea oportunitate | În plus: actualizări ale planului și remindere detaliate; canalele se activează explicit |

Analiza documentelor există deja în cod; limitele sale sunt în [Date personale](../docs/date-personale.md). Nu este necesară pentru recompensă. Vocea și livrarea alertelor sunt comportamente aprobate de produs, încă de implementat; WhatsApp rămâne propunere separată.

### Teasere și valori necunoscute

- **Noutăți rămâne public.** În Pentru tine, primul ghid eligibil deblocat se vede integral, iar celelalte apar ca teasere; nu estompăm întregul flux.
- În teaser afișăm o categorie scurtă (de exemplu „Deducere fiscală”), etichetele relevante, condițiile esențiale de eligibilitate, beneficiul potențial cu perioada, marcajul „exemplu estimativ” sau „calculat pe datele confirmate” și linkul oficial. Acceptăm că sursa poate dezvălui numele legii. Ascundem/estompăm titlul detaliat, explicația și pașii personalizați; nu ascundem dovada unei sume.
- **Statutul legii și disponibilitatea acțiunii sunt distincte.** O lege poate fi în vigoare, dar termenul unei acțiuni să fie depășit. Nu numim întreaga lege „expirată” doar pentru că nu mai poate fi folosită acea oportunitate. Termenele închise nu sunt prezentate ca beneficii disponibile.
- **Costul unei schimbări și economia unei acțiuni sunt distincte.** O taxă nouă poate apărea în flux cu impact negativ; numai o acțiune disponibilă care îmbunătățește rezultatul poate contribui la justificarea Pro.
- Vizitatorii fără date suficiente văd un **profil exemplu numit**, cu ipoteze și surse vizibile. Nu introducem valori statistice în profilul lor real. Datele personale lipsă rămân necunoscute; la completare recalculăm separat rezultatul personalizat.
- Nu numim mediile „mediane” și nu confundăm venitul pe gospodărie cu salariul net individual, brutul cu netul sau cheltuiala totală cu consumul unei categorii. Nu avem confirmată o pereche actuală de mediane românești potrivită pentru salariu net lunar și cheltuieli personale. Valorile și perioadele statistice pentru exemple rămân **TODO până la verificarea sursei și a definiției**; vezi [bibliografia pentru această decizie](bibliografie.md#surse-pentru-deciziile-de-freemium-din-29-octombrie-2026).
- Text: „Exemplu estimativ. Completează veniturile și cheltuielile pentru calculul tău.” Estimările demonstrative nu confirmă eligibilitatea, nu consumă deblocări și nu intră în pragul Pro. În această stare invităm la completarea datelor, nu la cumpărarea pe baza unei sume fictiv personalizate.

### Profil complet și recompensa unică

„Complet” înseamnă că utilizatorul a revizuit categoriile relevante suportate și a confirmat profilul rezultat. „Nu se aplică” și „Prefer să nu spun” sunt răspunsuri valide. Nu cerem mai multe etichete pozitive, venituri exacte inutile, documente, microfon sau acord pentru email ca să acordăm recompensa. Informațiile omise pot împiedica verificarea unei oportunități; nu anulează recompensa.

- O deblocare inițială gratuită; **încă o deblocare**, acordată o singură dată pentru completare. Nu sunt două recompense suplimentare și nu se reînnoiesc lunar.
- Navigarea și completarea profilului pot începe ca vizitator. **Contul gratuit este cerut la revendicarea deblocării suplimentare**, pentru a salva dreptul. Niciun card și niciun abonament la newsletter nu sunt necesare.
- Persoanele care și-au completat deja profilul înainte de lansarea recompensei o primesc în aceleași condiții. Editarea repetată, trecerea între voce și formular sau ștergerea datelor din browser nu acordă din nou recompensa aceluiași cont.
- Înregistrăm acordarea și consumul pe cont, fără a reatribui deblocarea inițială deja folosită la asocierea sesiunii de vizitator. Nu folosim acte de identitate sau urmărire invazivă pentru a împiedica toate conturile multiple; acceptăm limita unei protecții rezonabile per cont.
- Dacă nu există o a doua oportunitate verificată, **creditul rămâne disponibil fără termen artificial de expirare**. Promitem acces la un viitor ghid, nu existența sau data unei viitoare legi.

Text: „Completează-ți profilul și primești o deblocare gratuită în plus. O poți folosi când găsim o altă oportunitate verificată pentru tine.”

### Onboarding vocal sau manual

Vocea ElevenLabs este o cale opțională și scurtă de completare a profilului, nu un consultant financiar cu discuții nelimitate. Agentul extrage etichete, întreabă despre categoriile lipsă și încheie cu un profil editabil. Utilizatorul confirmă înainte ca propunerile vocale să fie folosite ca date confirmate. Formularul manual rămâne la vedere și câștigă aceeași recompensă.

Agentul nu inventează sume sau eligibilitate; calculele vin din motorul verificat. Informăm despre procesarea externă înainte de pornirea microfonului și configurăm explicit retenția. Costul sesiunii, corectitudinea etichetelor și rata de finalizare trebuie măsurate față de formular. Setările tehnice de retenție și integrarea rămân de implementat; nu promitem procesare exclusiv locală.

### Oportunități întreținute pe etichete

Fiecare etichetă duce la un set întreținut de oportunități verificate, nu la o recomandare fixă sau la o promisiune de economii. Includem legi mai vechi ale căror beneficii sunt încă disponibile. **Noutăți** arată ce s-a schimbat; **Pentru tine** arată ce poate fi făcut acum, după verificarea condițiilor suplimentare.

La închiderea unui termen, actualizăm cardul și pagina de intrare distribuită public. Persoanele care vin târziu pot vedea alte oportunități încă disponibile sau opțiunea de monitorizare. Nu menținem un teaser ca și cum acțiunea ar mai fi deschisă doar pentru a converti traficul.

### Cum alegem oportunitatea gratuită

O oportunitate este o acțiune concretă pe care persoana o poate face, nu simpla existență a unei legi sau a unei taxe noi.

1. **Filtrăm candidații.** Sursa, articolul, formula și data verificării trebuie confirmate în catalog sau cercetare. Eligibilitatea trebuie confirmată din informațiile oferite de utilizator, costurile obligatorii cunoscute, beneficiul net pozitiv și acțiunea încă posibilă. Proiectele, termenele expirate, acțiunile deja finalizate și potrivirile bazate numai pe etichete nu sunt candidați. Un act adoptat poate intra numai dacă permite deja acțiunea și data efectului este verificată.
2. **Prioritizăm urgența utilă.** Dacă există candidați cu termen în următoarele 30 de zile, alegem termenul cel mai apropiat. La același termen, alegem beneficiul net mai mare în următoarele 12 luni.
3. **În lipsa unui termen apropiat, alegem beneficiul net maxim** în următoarele 12 luni. La egalitate, preferăm termenul cel mai apropiat (fără termen vine ultimul), apoi identificatorul stabil al oportunității. Fereastra de 30 de zile este o regulă inițială de produs, nu un termen legal.
4. **Explicăm alegerea:** „Am ales această oportunitate pentru că termenul este cel mai apropiat” sau „Are cel mai mare beneficiu net verificat pentru profilul tău în următoarele 12 luni”. Nu folosim comisioane, parteneriate sau probabilitatea de cumpărare pentru clasament.
5. **Păstrăm accesul după prima deschidere.** Ghidul gratuit rămâne deblocat, inclusiv corecțiile sale. Nu îl ascundem la revenire, schimbarea ordinii sau anularea Pro. Înainte de prima deschidere, alegerea se poate recalcula la actualizarea profilului.
6. **După finalizare sau expirare**, ghidul rămâne accesibil în istoric, cu starea corectă; nu acordăm un credit nou. Deblocarea suplimentară pentru profil complet urmează aceeași selecție, dintre candidații încă nedeblocați. Orice valoare deja deblocată gratuit rămâne exclusă din justificarea Pro.

### Când se consumă o deblocare

Verificăm condițiile necesare înainte de afișarea ghidului complet. Un răspuns care exclude eligibilitatea sau lipsa unei informații necesare nu consumă creditul. Deschiderea printr-un drept gratuit consumă o singură deblocare și păstrează accesul la acel ghid; redeschiderea sau retrimiterea aceleiași cereri nu consumă încă un credit. Accesul inclus într-un abonament Pro activ nu consumă creditele gratuite.

După dezvăluire, „Nu mi se aplică” corectează profilul ori raportează o problemă, dar **nu restituie automat creditul**. Restituim un credit când este stabilită o eroare a regulii sau a potrivirii noastre. Simpla apăsare a butonului, schimbarea ulterioară a situației personale ori expirarea termenului nu reîncarcă soldul. Eligibilitatea calculată din răspunsuri nu este o verificare a identității sau o aprobare de la autoritate.

### Nicio oportunitate disponibilă: următorul ghid e din partea noastră

Dacă profilul a fost completat și nu găsim candidat verificat, spunem **„nu am găsit în catalogul verificat”**, nu „nu există nicio lege pentru tine”. Păstrăm deblocările nefolosite, nu consumăm nimic și nu propunem Pro.

> Momentan, nu am găsit în catalogul verificat o oportunitate disponibilă pentru profilul tău.
> Deblocările tale gratuite rămân disponibile. Următorul ghid complet e din partea noastră.

Putem arăta cea mai recent închisă oportunitate relevantă și verificată, cu sursă și termen, ca exemplu educativ: „O oportunitate anterioară pentru persoane cu un profil similar a fost [oportunitate]. Termenul s-a încheiat la [data].” Nu afirmăm că persoana a pierdut bani sau ar fi fost eligibilă fără dovezi despre situația ei de atunci. Exemplul nu intră în economii, nu consumă credit și lipsește dacă nu avem unul verificat.

Oferim separat „Anunță-mă când apare o oportunitate potrivită”, cu alegerea canalului. Refuzul nu afectează creditul. Dacă informațiile sunt încă insuficiente, cerem doar ce lipsește pentru verificare și nu prezentăm lipsa datelor drept lipsa oportunităților.

### Când afișăm oferta Pro

Calculăm mai întâi valoarea accesibilă gratuit, inclusiv deblocarea pentru profil complet, apoi valoarea suplimentară a celorlalte acțiuni. Creditele gratuite disponibile se alocă în simularea comparației candidaților după regula de selecție de mai sus, fără a le consuma. Nu amânăm contabilizarea recompensei până când utilizatorul apasă pe ghid sau își creează contul pentru a face oferta Pro să pară rentabilă. Aplicăm aceeași regulă tuturor îndemnurilor comerciale: antet, carduri, ecrane de deblocare și mesaje. Un utilizator poate consulta voluntar pagina de preț și își poate gestiona abonamentul existent; acestea nu sunt o ofertă proactivă.

**Regula inițială: S12 ≥ C12**, unde:

- **S12** este beneficiul net suplimentar verificat și încă accesibil prin acțiuni compatibile din următoarele 12 luni, față de scenariul în care utilizatorul folosește oportunitățile gratuite. Excludem ambele drepturi gratuite când recompensa de completare este câștigată, ghidurile deja deblocate gratuit, exemplele statistice, acțiunile finalizate, economiile deja realizate și beneficiile automate care nu necesită acțiune. Dacă există numai două oportunități și ambele sunt gratuite, S12 este zero și nu propunem Pro.
- **C12** este prețul total plătibil de utilizator pentru 12 luni la oferta afișată, cu taxele obligatorii incluse. La prețul de referință de 15 lei/lună: **C12 = 180 lei**. Dacă totalul de checkout diferă, pragul și textul trebuie recalculat înainte de afișare.

Folosește aceeași fereastră de timp pentru toate acțiunile și numără doar lunile după intrarea în vigoare și după îndeplinirea condițiilor. Nu extrapola o economie temporară la un an întreg. Pentru o plată unică, include suma o singură dată și arată când poate fi primită. Pentru beneficii întinse pe mai mulți ani, include numai partea din următoarele 12 luni. Nu prezenta S12 împărțit la 12 drept venit lunar când beneficiile sunt unice sau neregulate. Arată separat calendarul încasărilor și plăților: pragul nu înseamnă recuperarea abonamentului din prima lună.

**Ce înseamnă „verificat” pentru acest calcul:**

- Act, articol, Monitorul Oficial, link oficial, formulă și dată a verificării disponibile; fără puncte critice marcate TODO sau contradicții nerezolvate.
- Condițiile de eligibilitate și datele de intrare necesare sunt confirmate din răspunsurile utilizatorului; o potrivire de etichete nu ajunge. Verificarea nu reprezintă aprobarea unei cereri de către autoritate.
- Scădem cheltuielile și taxele obligatorii suplimentare pentru obținerea beneficiului. Dacă acestea nu pot fi calculate, excludem acțiunea din S12. Sumele pe care utilizatorul trebuie să le blocheze sau să le contribuie se afișează separat și nu sunt prezentate drept economii.
- Evităm dublarea aceleiași economii și respectăm plafoanele și dependențele. Pentru alternative incompatibile calculăm un singur scenariu fezabil, fără a le însuma. Dacă compatibilitatea nu poate fi verificată, nu folosim totalul pentru ofertă.
- O majorare de taxă identificată este impact negativ, nu economie. Un beneficiu automat este informare, nu valoare suplimentară deblocată de Pro. Estimările incerte și drepturile încă neconfirmate rămân vizibile ca atare, dar sunt excluse din prag.
- Recalculăm după schimbarea profilului, prețului, catalogului, termenelor sau stării acțiunilor și înainte de afișarea ofertei. Dacă dovada nu mai este valabilă ori S12 scade sub C12, retragem îndemnul Pro. Gestionarea abonamentului rămâne accesibilă; nu modificăm automat un contract existent.

**Sub prag sau cu date insuficiente:** utilizatorul rămâne gratuit, fără mesaj de upgrade. Monitorizarea poate identifica ulterior o oportunitate verificată care justifică oferta. Nu mărim cifrele, nu includem economiile gratuite și nu atribuim o valoare fictivă comodității pentru a atinge pragul. Nu promitem că utilizatorul va încasa suma.

Text orientativ, cu variabile completate numai din date verificate:

> Ai [N] oportunități suplimentare, cu un beneficiu net potențial verificat de [S12] lei în următoarele 12 luni, peste oportunitățile tale gratuite. Pro costă 15 lei/lună (180 lei dacă îl păstrezi 12 luni). Vezi condițiile și calendarul înainte să alegi.

### Cazuri de verificat la implementare

Exemplele următoare sunt **date sintetice de test, nu economii din legi reale**; toate sumele sunt nete, verificate și pe aceeași fereastră de 12 luni dacă nu se precizează altfel. „Restul” înseamnă oportunitățile rămase după alocarea tuturor drepturilor gratuite câștigate.

| Situație | Rezultat așteptat |
|---|---|
| Oportunitatea gratuită valorează 300 lei; restul însumează 100 lei | Fără ofertă: valoarea suplimentară este sub 180 lei |
| Restul oportunităților compatibile însumează exact 180 lei | Oferta poate apărea; egalitatea satisface pragul |
| Restul însumează 179 lei | Fără ofertă |
| Două alternative exclusive valorează 100 și 120 lei | Nu însumăm 220 lei; fără ofertă |
| Economie de 20 lei/lună, disponibilă doar 3 luni | Numărăm 60 lei, nu 240 lei; fără ofertă dacă nu există alte economii |
| Un beneficiu suplimentar unic de 200 lei în fereastra de 12 luni | Oferta poate apărea; precizăm data și caracterul unic |
| Doar o creștere de taxe, o sumă cu eligibilitate necunoscută sau nicio oportunitate | Fără ofertă |
| Expirarea unei acțiuni duce S12 sub cost | Oferta dispare la reevaluare |
| Oportunitate eligibilă cu termen apropiat și alta mai valoroasă fără termen apropiat | Prima devine gratuită; numai valoarea suplimentară rămasă intră în prag |
| Profil complet, exact două oportunități verificate | Ambele sunt accesibile prin drepturile gratuite; S12 = 0, fără ofertă Pro |
| Recompensă câștigată, dar încă nerevendicată prin cont | Excludem valoarea ei din comparația Pro; nu profităm de întârzierea revendicării |
| Profil complet, fără altă oportunitate disponibilă | Creditul se păstrează; fără sumă sau dată inventată pentru o oportunitate viitoare |
| „Prefer să nu spun”, formular manual sau refuz de email | Recompensa rămâne disponibilă după revizuirea și confirmarea profilului; datele insuficiente limitează eligibilitatea |
| Profil deja complet înainte de lansarea recompensei | Recompensa se acordă o singură dată după asocierea contului |
| Eligibilitate respinsă înainte de dezvăluire | Nu consumăm creditul |
| „Nu mi se aplică” după dezvăluire | Fără restituire automată; numai o eroare stabilită a regulii/potrivirii justifică restituirea |
| Redeschidere, cerere repetată sau ștergere localStorage pentru același cont | Ghidul rămâne deblocat; nu consumăm din nou și nu reatribuim recompensa |
| Sumă mare calculată numai dintr-un profil exemplu | Rămâne ilustrativă; nu verifică eligibilitatea și nu declanșează Pro |
| Lege în vigoare, dar acțiune cu termen depășit | Statutul legii rămâne corect; acțiunea nu intră în economiile disponibile |
| Exemplu istoric, fără date despre situația persoanei de atunci | Îl prezentăm drept exemplu pentru profil similar, nu pierdere personală |
| Nu există noutăți relevante în luna aleasă | Niciun rezumat lunar trimis |
| Profil complet fără opt-in de comunicare | Niciun digest sau mesaj de oportunitate trimis automat |
| Alertă pentru următoarea oportunitate deja livrată | Nu transformăm opțiunea în alerte recurente fără o alegere nouă |

## 2. Notificările și valoarea recurentă

**Profil complet nu înseamnă abonare la email.** Politica aleasă este opt-in explicit, separat și nebifat în avans, atât pentru utilizatori gratuiți, cât și pentru abonați. Nu condiționăm contul, recompensa sau utilizarea vocii de acceptarea mesajelor. Păstrăm alegerea, momentul și versiunea textului acceptat și oferim dezabonare simplă. Este politica produsului; nu afirmăm că legea exclude orice excepție pentru orice cont gratuit. Contextul juridic verificat în discuție este în [bibliografie](bibliografie.md#surse-pentru-deciziile-de-freemium-din-29-octombrie-2026).

| Mesaj | Acces și activare | Când îl trimitem |
|---|---|---|
| Rezumat lunar pe email | Gratuit și Pro; opt-in distinct după afișarea rezultatului profilului și acordarea recompensei | Numai dacă există noutăți relevante; fără email de „lună liniștită” |
| Următoarea oportunitate | Gratuit, cerut separat; persoana alege email sau push | La următoarea oportunitate verificată și acționabilă potrivită, fără a aștepta digestul lunar; după livrare cerem o alegere nouă pentru alerte continue |
| Actualizări de plan și remindere detaliate | Pro, prin canalele activate de utilizator | Pentru schimbări relevante și termenele acțiunilor din plan, fără mesaje de umplutură |
| Mesaje necesare de cont, securitate sau plată | Legate de operația solicitată | Nu sunt folosite pentru a strecura oferte Pro sub eticheta „tranzacțional” |

Rezumatul gratuit conține informații utile și surse oficiale, cu acces la ghidurile deblocate. Nu este doar o serie de teasere fără conținut. Nu trimitem duplicat prin email și push în mod implicit. Preferințele digestului, alertei următoare și reminderelor sunt separate; dezabonarea nu retrage deblocările și nu anulează automat un abonament plătit.

Text pentru digest:

> Vreau un rezumat lunar pe email cu schimbările relevante pentru mine. Dacă nu sunt noutăți, nu primesc email.

Text pentru alerta distinctă:

> Anunță-mă când apare o oportunitate potrivită.

Alerta poate include un beneficiu cu aplicare largă, dar verificăm condițiile sale; nu spunem „pentru fiecare român” fără dovadă. Dacă datele profilului sunt incomplete sau pot fi depășite, spunem „S-ar putea să ți se aplice; confirmă datele”, fără sumă personalizată certă. Nu consumăm creditul la trimiterea alertei sau la confirmarea detaliilor, ci numai la dezvăluirea ghidului după verificare.

Orice promovare Pro într-un mesaj trebuie să respecte atât alegerea de comunicare, cât și pragul S12 ≥ C12. O alertă solicitată despre următoarea oportunitate gratuită nu este permisiune generală pentru campanii comerciale. Dacă introducem oferte comerciale în comunicări, scopul trebuie explicat în opțiunea acceptată; nu îl extindem în tăcere.

Legile cu efect indirect rămân marcate „informativ”. Proiectele se disting de drepturile disponibile și nu produc economii verificate. Știrile nefinanciare rămân în afara scopului actual. Nu inventăm notificări săptămânale pentru a crește frecvența produsului.

### Rezumatul pe WhatsApp

Propunere anterioară, separată de emailul lunar și alerta aprobate acum; nu este o funcție inclusă implicit în această decizie.

- **Doar cu acord explicit.** Numărul de telefon ar ajunge pe serverul nostru pentru această extensie; datele și retenția trebuie explicate înainte de activare.
- **Mesajul nu conține sume sau date personale.** Exemplu: „Ai 2 noutăți, una cu termen pe 25 mai. Deschide aplicația.”
- **Mesajele trimise de noi după fereastra de 24 de ore folosesc șabloane aprobate de Meta** ([Meta, Message templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)).
- **Cost:** din 1 octombrie 2026, în România, 0,0712 € per mesaj de marketing și 0,0239 € per mesaj utilitar ([Profit.ro](https://profit.ro/romania-conectata/schimbare-la-whatsapp-apare-plata-pentru-mesajele-de-asistenta-pe-whatsapp-business-api-22793043), sursă secundară; tabelul oficial de prețuri: [Meta, rate cards](https://developers.facebook.com/docs/whatsapp/pricing#rate-cards), `TODO`). La 4 rezumate pe lună: **≈ 0,10–0,28 € per abonat**.

## 3. Calculul și butoanele „du-mă unde rezolv”

1. **LLM-ul citește legea** și propune etichetele, formula și acțiunile. Un om verifică, apoi actul intră în catalog.
2. **Suma o calculează codul** (`lib/formule.ts`), nu LLM-ul. Aceeași formulă și aceleași cifre dau același rezultat de fiecare dată, și totul poate fi verificat.
3. **LLM-ul explică, răspunde la întrebări și citește documentele.** Cifrele extrase din documente le calculează tot codul.

**„Ce poți face” e personalizat pe profil:** îți arătăm care dintre acțiunile prevăzute de lege ți se aplică ție, cu suma și termenul tău. Nu recomandăm produse (`CLAUDE.md`). Atenție la o limită: consultanța fiscală fără înscriere la Camera Consultanților Fiscali e infracțiune ([OG 71/2001, art. 25 alin. 2](https://legislatie.just.ro/Public/DetaliiDocument/30386)). Granița dintre informație și consultanță e de confirmat cu un jurist.

| Tipul acțiunii | Unde duce butonul | Exemplu |
|---|---|---|
| Depui ceva la stat | Pagina oficială (ANAF SPV, ghișeul.ro) | Declarația Unică |
| Alegi o opțiune prevăzută de lege | Pagina oficială, cu termenul | Pilon II: cererea la fond |
| Beneficiu de care nu știai | Unde îl ceri | Deducerea Pilon III |
| Schimbi furnizorul | Comparatorul ANRE ([energie](https://posf.ro/comparator?comparatorType=electric), [gaz](https://posf.ro/comparator?comparatorType=gas)), apoi furnizorii în ordine alfabetică | Energie |
| Nu ai nimic de făcut | „Nu trebuie să faci nimic până la {data}” | Gazul, până la 31 martie 2027 |
| Situație complicată | Registrul public al profesiei, neplătit | Dividende față de salariu |

## 4. Afilierea și furnizorii

**Ce face aplicația acum** (`lib/continut.ts`, `business/parteneri.json`): pentru energie și gaz arată întâi comparatorul oficial, apoi furnizorii **în ordine alfabetică**, nu după preț sau comision. Eticheta „partener” apare doar unde există program de afiliere.

**Ce am găsit în 2Performant (octombrie 2026):**
- **Lipsesc categoriile de energie și bănci** ([2Performant, Affiliate Programs](https://2performant.com/affiliate-programs/)).
- **Orange nu mai apare.** Pagina programului dă 404, iar categoria [Telecom](https://2performant.com/affiliate-programs/telecom/) are doar reincarcareprepay.ro.
- **Preluarea Profitshare de către 2Performant a fost anulată** în august 2025 ([Business Forum](https://www.businessforum.ro/industry/20250812/2performant-drops-profitshare-deal-2182)).

**Concluzia:** nu punem venit din afiliere în pitch.

**Ce excludem de la afiliere, și de ce:**
- **Asigurări:** după Legea 236/2018, site-urile care compară asigurări fac distribuție de asigurări (art. 3 alin. 1 pct. 9) și trebuie înregistrate la ASF (art. 8 alin. 1) ([legislatie.just.ro](https://legislatie.just.ro/Public/DetaliiDocumentAfis/205851)). Afilierea la brokeri precum Pint.ro intră aici.
- **Pilon III și investiții:** trimitem doar la [registrul ASF al pensiilor private](https://data.asfromania.ro/scr/rp), neplătit.
- **Credite:** sunt reglementate. De confirmat cu un jurist.

**Dacă apar programe pentru energie sau telecom** (**[decizie de echipă]**):
- ordinea rămâne cea de acum, alfabetică, după comparatorul oficial;
- linkul plătit e marcat;
- nu scriem niciodată „cea mai bună ofertă” (`CLAUDE.md`).

## 5. Specialiștii

Rezumat din `business/profesionisti.md`:
- Cele mai multe situații se rezolvă cu pașii din card.
- Când e nevoie de un specialist, butonul duce la registrul public, gratuit.
- **Nu luăm comision de la profesioniști.** La avocați e interzis explicit: Statutul profesiei, art. 174, interzice plata sau primirea de comision pentru trimiterea de clienți ([Statutul, versiunea din 13.09.2024](https://unbr.ro/wp-content/uploads/2024/09/sintact-statut-din-2011-al-profesiei-de-avocat_2024-09-13.pdf)).
- Un marketplace de consultanță plătit prin Stripe Connect ar contrazice textul pe care aplicația îl arată deja: „Nu primim bani de la specialiști”.

## 6. Datele personale

- **Documentele sunt transmise extern:** la serverul aplicației și, în modul AI real, la Anthropic. Fișierul original nu este mascat automat înainte de trimitere; mascarea CNP/IBAN se aplică rezultatului întors de model.
- **Profilul manual este salvat în browser în implementarea curentă.** Acest fapt nu susține o promisiune generală că nimic nu părăsește dispozitivul. Google și Stripe procesează datele de conectare și abonament în fluxurile lor.
- **Retenția furnizorilor nu este verificată prin această actualizare.** Nu promitem absența stocării în toate sistemele. Înainte de încărcare, explicăm destinațiile fișierului; formularul manual rămâne alternativa.
- **Contul gratuit va păstra recompensa și deblocările** pentru aplicarea regulii o singură dată per cont. Activarea vocii și comunicărilor are informare și preferințe separate de autentificare.
- **Potrivirea pentru alerte în fundal rămâne de proiectat:** sunt necesare date minime de contact/livrare, preferințe și o modalitate de verificare a potrivirii când browserul este închis. Nu presupunem prin această decizie transferul tuturor profilurilor, documentelor sau înregistrărilor vocale pe server. Câmpurile sincronizate, retenția și ștergerea trebuie precizate înainte de implementare.
- Fluxurile curente și limitele pentru voce/email sunt în [Date personale](../docs/date-personale.md).

## 7. Plata

- Plata web și gestionarea abonamentului urmează decizia din [ADR 0002](../docs/adr/0002-abonament-stripe.md); politica de acces și de promovare urmează ADR 0003.
- Planul gratuit nu cere card sau pornirea unei probe. Plata este o alegere explicită; freemium nu se transformă automat în abonament.
- Nu introducem prin această decizie un plan anual sau abonamente prin App Store / Google Play. Distribuția și plățile pe alte platforme rămân propuneri separate.
- Pentru comparația cu economiile folosim totalul afișat la checkout, inclusiv taxele obligatorii; diferențele față de prețul de referință trebuie rezolvate înainte de ofertă.

## 8. Unit economics și validare

**Abonați noi într-o cohortă ≈ utilizatori cu profil complet × proporția care îndeplinește pragul după ambele drepturi gratuite × conversia în rândul celor cărora li se afișează oferta.** Venitul recurent brut lunar este numărul abonaților activi × prețul lunar; retenția și anulările schimbă acest număr. Beneficiile calculate nu sunt venit și nu sunt economii realizate până la confirmarea rezultatului.

| Indicator / ipoteză | Valoare |
|---|---|
| Preț Pro de referință | 15 lei/lună, decizie de produs; 180 lei pentru 12 luni, prin calcul |
| Proporția profilurilor cu suficientă valoare suplimentară verificată | TODO: de măsurat după excluderea ambelor drepturi gratuite |
| Conversia ofertă eligibilă → plată | TODO: de măsurat |
| Utilizarea și finalizarea oportunității gratuite | TODO: de măsurat |
| Completarea profilului și efectul recompensei | TODO: potriviri verificate, revendicarea/utilizarea creditului și conversie ulterioară; nu optimizăm doar numărul profilurilor complete |
| Voce față de formular | TODO: corectitudinea etichetelor, finalizare și cost per sesiune |
| Credit păstrat până la o nouă oportunitate | TODO: timpul până la o potrivire, revenirea după alertă și utilizarea ghidului |
| Comunicări | TODO: opt-in, dezabonare, revenire și acțiuni utile; nu echivalăm deschiderea emailului cu o economie |
| Retenția în a doua lună și motivele anulării | TODO: de măsurat; separat pentru beneficii unice și recurente |
| Beneficii realizate față de potențialul calculat | TODO: feedback voluntar, fără a presupune că un click înseamnă economie |
| Marja per abonat | TODO: preț minus taxe, comisioane și costuri variabile |
| Costul servirii utilizatorilor gratuiți | TODO: include voce opțională, email/alerte, conturi și deblocări, găzduire, verificare și suport |
| Costuri fixe lunare | 7.500 lei, ipoteză istorică de buget, de revalidat |

**Prag de rentabilitate:** (costuri fixe + costul utilizatorilor gratuiți) / marja lunară per abonat. Numărul de abonați necesari este TODO până confirmăm costurile. Estimările vechi bazate pe 299 lei/an și conversia după trial nu se transferă acestui model.

Primul test urmărește dacă oamenii folosesc oportunitățile gratuite, dacă recompensa îmbunătățește calitatea potrivirilor și dacă achiziția și retenția în luna a doua justifică modelul. Acceptăm că persoanele cu numai două oportunități pot rămâne gratuite până la apariția alteia. Fereastra de urgență de 30 de zile și un eventual prag mai mare decât costul sunt ipoteze de optimizat ulterior; regula inițială este S12 ≥ C12. Dacă oamenii plătesc numai pentru analiza inițială, evaluăm separat un raport cu plată unică; acesta nu este un plan aprobat acum.

## 9. Promovare fără sponsorizări

1. **Un calculator public, gratuit, pentru fiecare lege mare**, ca intrare în planul gratuit și prima oportunitate completă.
2. **Widget gratuit pentru redacții**, cu atribuire.
3. **Carduri de rezultat de distribuit:** „Noile reguli mă costă −120 lei/lună. Pe tine?”
4. **Distribuirea experienței gratuite** între utilizatori reali. Recompensele în luni Pro nu sunt activate prin această decizie și nu ocolesc pragul de valoare.
5. **Prin angajator:** platformele de beneficii flexibile [Edenred Benefit](https://benefit.edenred.ro), [Pluxee MyBenefits](https://www.pluxee.ro/produse/mybenefits-beneficii-flexibile/), [Up MultiBeneficii](https://upromania.ro/companii/up-multibeneficii/). Angajatorul plătește abonamentul, fără acces la date. Merge bine cu etichetele de domeniu.
6. **Fără postări plătite la influenceri.** Context:
   - În verificarea internațională ICPEN din 2026, ANPC a constatat că influencerii români nu marchează constant reclamele ([Digi24](https://www.digi24.ro/stiri/sci-tech/lumea-digitala/activitatea-influencerilor-verificata-de-anpc-publicitatea-nu-era-marcata-constant-70-au-creat-continut-cu-ai-fara-a-informa-3844799), sursă secundară).
   - Din 27 septembrie 2026, creatorii cu peste 100.000 de urmăritori notifică CNA ([CNA, Decizia 116/2026](https://www.cna.ro/a-comunicat-de-presa-decizia-cna-nr-1162026-a-fost-publicata-in-monitorul-oficial-ce-se-schimba-si-ce-nu-se-schimba-in-mediul-online-uymghr17p67ul6wl9iuxjc6h/)).

## 10. Răspunsuri scurte pentru juriu

- **„De ce nu întreb ChatGPT?”** Noi venim la tine fără să întrebi. Formula e verificată de un om. Cardul are termenul și butonul care te duce unde rezolvi.
- **„De ce să plătesc?”** Ai un ghid gratuit și încă o deblocare pentru profil complet. Îți propunem Pro numai când oportunitățile suplimentare verificate acoperă costul pe aceeași perioadă.
- **„Dacă nu găsiți nimic acum?”** Păstrezi deblocările. Poți cere o alertă când apare o oportunitate potrivită; nu plătești ca să aștepți.
- **„E sfat financiar?”** Arătăm acțiunile prevăzute de lege care ți se aplică ție, cu articolul alături. Nu recomandăm produse.
- **„Cât de des primesc ceva?”** Alegi separat rezumatul lunar și alerta pentru următoarea oportunitate. Fără noutăți relevante, nu trimitem digest. Pro adaugă reminderele planului, pe canalele activate.
- **„De ce n-ați luat comision de la furnizori?”** Pentru energie și bănci nu există programe deschise. La asigurări, comparația e distribuție reglementată de ASF. Și oricum, neutralitatea e produsul nostru.

## De confirmat

- Validarea prețului de referință de 15 lei/lună, conversia numai în cohorta eligibilă și retenția în luna a doua.
- Tabelul oficial de prețuri WhatsApp (Meta) și cursul BNR.
- Cu un jurist: granița dintre informație și consultanță fiscală.
- Implementarea selecției, recompensei unice pe cont, consumului fără restituire automată, teaserelor și pragului S12 ≥ C12 după toate drepturile gratuite, inclusiv cazurile din secțiunea 1.
- Sursele, populațiile și perioadele potrivite pentru profilurile exemplu; fără valori statistice inventate sau introduse în profilul real.
- Integrarea ElevenLabs, costul, informarea și retenția; manualul rămâne echivalent.
- Livrarea digestului și alertei, dovada preferințelor, deduplicarea și dezabonarea; câmpurile minime pentru potrivirea în fundal și ștergerea lor.
- Știrile nefinanciare pe domeniu rămân în afara scopului actual; necesită decizie separată.
