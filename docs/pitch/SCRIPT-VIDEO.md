# Pocket (Buzunar): scriptul video, 3 minute

Structura de la mentori: **0:00–0:20** problemă și soluție · **0:20–2:00** demonstrație · **2:00–2:40** cum funcționează · **2:40–3:00** valoare și încheiere.

Ritm: ~140 de cuvinte pe minut, ~400 de cuvinte în total. Citiți o dată cu cronometrul înainte de înregistrare.

## Înainte de filmare

- Link: **https://main.d35dxj4gdere6m.amplifyapp.com** (are comutatorul Basic | Premium).
- Fereastră incognito, limba **EN**, pe „For you” comutați pe **Premium**, exemplul Andrei, 32.
- Zoom 110–125%, bara de favorite ascunsă, înregistrare 1080p (OBS sau Win+G). Vocea separat, pe telefon.

## Scriptul

### 0:00–0:20 · Problemă și soluție

**0:00** *(ecran: pagina de start)*
Romania publishes about eleven thousand official acts a year. One in ten changes someone's money, and nobody tells you which one is yours.

**0:09**
Sign your first job before registering with the employment office, and you lose twenty-seven thousand lei.

**0:14** *(ecran: „For you”)*
Pocket tells you which laws change your money, by how much, and by when.

### 0:20–2:00 · Demonstrație

**0:20** *(ecran: Profile, apasă „Salary”, scrie „I work in IT”)*
Start with a profile. Answer six quick questions, or upload a payslip. The AI suggests tags, and you confirm them. We never connect to your bank.

**0:38** *(ecran: „For you”, bilanțul și barele)*
"For you" shows only the laws that match you. At the top, your yearly balance: red is what new laws cost you, green is what you can keep if you act.

**0:50**
Andrei, our example, loses eight thousand seven hundred lei a year.

**0:55** *(ecran: coloana de termene din dreapta)*
On the right, your deadlines, counted from the dates written in the law.

**1:02** *(ecran: deschizi o lege, comparația înainte → acum)*
Open a law: what changed, before and now, what you can do, and by when.

**1:10** *(ecran: „Why?” și „Show me the law”)*
"Why?" explains it with an example. "Show me the law" links the exact article.

**1:17** *(ecran: butonul de acțiune)*
One tap takes you to the right official form, not to a product.

**1:23** *(ecran: „Ask”, apoi „What should I do?”, lasă răspunsul să apară)*
Still unsure? Tap "Ask". The assistant answers from the text of this law: why it applies to you, what to do, and what happens if you don't.

**1:37** *(ecran: „All laws”, deschizi o lege)*
"All laws" lists every change, with the steps to take.

**1:43** *(ecran: „Add to my plan”, apoi Profile → My plan)*
Tick what you'll do, and My plan shows what you keep.

**1:48** *(ecran: previzualizarea notificării)*
And this is the notification you'd get the day a law appears.

**1:52** *(ecran: panoul „Free unlocks”)*
Your first law is free, plus one more when you complete your profile. Pro unlocks everything for fifteen lei a month, through Stripe.

### 2:00–2:40 · Cum funcționează

**2:00** *(ecran: slide cu 4 pași sau `/admin`)*
Pocket is built to read every new act from the official Legislative Portal, about thirty a day.

**2:07**
Simple rules and a fast Claude model keep the ones that touch money, about three a day.

**2:13** *(ecran: `/admin`, citatul din lege)*
A stronger Claude model drafts the card and must quote the law word for word, and code checks the quote.

**2:21** *(ecran: „Approve and publish”)*
A person approves before anything goes live.

**2:25**
The amounts are calculated by code, not by AI, so the same profile always gets the same number.

**2:33**
It's information, not financial advice.

*(text pe ecran, nespus: Next.js · Supabase · Stripe · Claude · RO / EN)*

### 2:40–3:00 · Valoare și încheiere

**2:40** *(ecran: logo)*
Taxes in Romania change fast: one 2025 law raised VAT on new homes from nine to twenty-one percent.

**2:47**
The news tells you what changed. Pocket tells you what it costs you, and how long you have to act.

**2:54** *(ecran: logo, link, QR)*
The next law with a deadline won't announce itself. We will.

## De verificat înainte de predare

- **Povestea cu 27.000 lei:** e spusă la persoana a doua, nu despre un coleg. Prima de stabilitate există din martie 2026 (OUG 11/2026). Dacă vreți povestea lui Andrei, spuneți-o doar dacă e adevărată.
- **„Built to read every new act”:** rularea zilnică e programată, dar nu spunem „reads every day” până nu rulează singură.
- **Notificarea e o previzualizare:** „you'd get”, nu „we send”.
- **Cifrele:** 11.000 de acte pe an, ~9% ating banii, ~31 pe zi, ~3 pe zi de interpretat (`docs/ingest.md`); 27.000 lei (OUG 11/2026); 8.748 lei/an pentru Andrei (motorul aplicației); 15 lei/lună (ADR 0002); TVA de la 9% la 21% (Legea 141/2025).
