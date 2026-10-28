# Modalul „Găsește un specialist”

*Texte pentru Andrei (#3). Fluxul complet e în `business/profesionisti.md`, secțiunea 3. Fără cratime și fără meme-uri, conform feedback-ului pentru regulile de voce (Matei, #6). Se ajustează după `voice-rules.md`.*

*Variabile: `{profesie}` = contabil / consultant fiscal / notar, `{intrebare}` = întrebarea tipică din tabelul din `profesionisti.md`, `{documente}` = ce ai pregătit, `{registru_url}` = registrul public al profesiei.*

## În card, sub pașii „Ce poți face”

**Situația ta e mai complicată?**
Buton: **Găsește un {profesie}**

## Modalul

**Titlu:** Când merită un {profesie}

**Text:**
Pașii de mai sus ajung pentru cei mai mulți oameni. Un {profesie} te ajută când răspunsul depinde de cifrele tale și suma e mare.

**Ce să întrebi:**
{intrebare}
*Buton mic:* Copiază întrebarea

**Ce să ai pregătit:**
{documente}

**Text mic:**
Te trimitem la registrul public al profesiei. Nu primim bani de la specialiști și nu trimitem nimic din profilul tău.

**Buton principal:** Deschide registrul
**Buton secundar:** Mă descurc singur

## Exemplu completat (Dividende 16%, `profesionist: "contabil"`)

**Titlu:** Când merită un contabil

**Text:**
Pașii de mai sus ajung pentru cei mai mulți oameni. Un contabil te ajută când răspunsul depinde de cifrele tale și suma e mare.

**Ce să întrebi:**
Mai merită să îmi iau banii din SRL ca dividende sau pe salariu, cu impozitul de 16%?

**Ce să ai pregătit:**
Profitul estimat pe anul acesta și cât ai vrea să scoți din firmă.

## Când actul nu are nevoie de specialist (`profesionist: null`)

Butonul nu apare. Dacă nu ai nimic de făcut, cardul spune:
**Nu trebuie să faci nimic până la {data}.** Te anunțăm dacă se schimbă ceva.
