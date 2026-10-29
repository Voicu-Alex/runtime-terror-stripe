# Aplicația Android: înveliș Capacitor peste aplicația Next.js, cu notificare pe telefon

Data: 29 octombrie 2026. Status: **propus** (ales de Claude la cererea lui Andrei; se adoptă după critica lui Andrei, conform „Decizii luate” din `CLAUDE.md`).

## Context

Pitch-ul din `docs/produs.md` începe cu telefonul care anunță: „Nou în Monitorul Oficial: … Pentru tine: −X lei/lună”. Până acum demo-ul e doar pe web (`next dev` local, plus pagina statică de pe descriere.andreidobrin.com, care nu e aplicația). Andrei a cerut o aplicație Android care, pentru juriu, arată ca o aplicație curată și poate trimite notificări. Criteriul lui: dacă cea mai rapidă variantă arată și ca o aplicație adevărată cu notificări, aceea se face.

Fapte verificate pe laptopul lui Andrei (29 oct 2026): Android SDK, emulator cu accelerare WHPX și GPU, Android Studio, JDK 21 și Node 24 sunt instalate și testate (`captures/android-emulator-gpu-home.png`, `captures/android-01-capacitor-proba-serverurl.png`). Aplicația Next.js nu e publicată nicăieri pe internet; `.env.example` pomenește Vercel, dar nu există un URL.

## Decizie

1. **Capacitor 8 peste aplicația Next.js existentă.** Un singur cod pentru web și Android; `android/` se generează cu `npx cap add android` și se commitează, ca în convenția Capacitor.
2. **WebView-ul încarcă aplicația de pe laptop**, nu dintr-un export static: `server.url` = `http://10.0.2.2:3200` în emulator (portul 3200 ca să nu se bată cu `next dev` al altor sesiuni pe 3000), iar pe telefon fizic prin `adb reverse tcp:3200 tcp:3200`. Exportul static (`output: 'export'`) ar omorî rutele `app/api/*`, Auth.js, acțiunea de server pentru documente și paginile cu `searchParams`. Când va exista o instanță publică HTTPS, `server.url` se mută acolo printr-o variabilă de mediu, fără alte schimbări.
3. **Notificarea de bază e locală** (`@capacitor/local-notifications`): textul vine din `notificariLa` din `lib/notificari.ts`, nu scris de mână, iar atingerea deschide cardul (`/flux?go=<id>`). Pe ecranul blocat arată identic cu un push și nu are nevoie de niciun cont. **Push-ul real (FCM)** cu `@capacitor/push-notifications` e o extindere, blocată de un proiect Firebase creat de Andrei.
4. **Ce se demonstrează pe telefon:** notificare → flux → card → „Arată-mi legea”. Conectarea Google și plata Pro se demonstrează pe web: Google refuză OAuth în WebView-uri încorporate (`disallowed_useragent`), iar mutarea autentificării într-un Custom Tab e un tichet separat, opțional.

## Alternative respinse

- **Trusted Web Activity (Bubblewrap):** cere un PWA publicat pe HTTPS cu `assetlinks.json`; nu există. Notificările ar fi web push prin Chrome, mai greu de controlat.
- **React Native / Expo:** rescrie interfața; nu refolosește componentele și designul v3 F.
- **Kotlin + Jetpack Compose:** rescrie totul; cel mai bun aspect nativ, dar nu încape înaintea pitch-ului.

## Consecințe și limite

- Demo-ul pe telefon depinde de laptop (dev server pornit, emulator sau cablu USB cu `adb reverse`). Fără laptop, aplicația arată pagina „Fără conexiune” din `www/`.
- Ca să nu arate ca o pagină web: bara de stare urmează `data-theme`, marginile edge-to-edge sunt tratate (targetSdk 35+), butonul înapoi navighează în istoric, link-urile externe (legislatie.just.ro, posf.ro) se deschid în Custom Tab. Acestea sunt criterii de acceptare, nu opțiuni.
- Permisiunea `POST_NOTIFICATIONS` (Android 13+) se cere la prima deschidere, cu un text scurt despre ce anunțăm.
- Nimic din acest ADR nu schimbă regulile de conținut: sumele și termenele rămân cele din catalogul verificat.
