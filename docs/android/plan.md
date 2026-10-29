# Aplicația Android: planul pentru orchestratorul Codex (Astra)

Pentru: **Astra**, instanța Codex care orchestrează. Astra nu scrie cod: dă fiecare tichet unui builder pe un model mai mic, apoi unui inspector care citește capturile și diff-ul, și decide dacă tichetul e gata. Builderii construiesc, inspectorul judecă, Astra raportează lui Andrei.

Citește înainte, în ordine: `CLAUDE.md`, `docs/adr/0005-android-capacitor.md` (decizia, cu status *propus*), `docs/echipa/README.md` secțiunea 4 (protocolul), apoi acest fișier. **`CLAUDE.md` și `docs/adr/` au prioritate față de `AGENTS.md`**, care e învechit (spune „fără Stripe” și numește `mockup/index.html` ca referință; ADR 0002 și ADR 0001 spun altceva). Tichetul T0 îl aduce la zi.

Starea curentă și ce s-a verificat deja: `.claude/session-state.md`, secțiunea „Android”.

## 1. Regulile orchestrării

1. **Worktree, nu checkout-ul principal.** Lucrezi numai în `.claude/worktrees/android` pe branch-ul `android` (creat din `deploy-descriere`, 29 oct 2026). Checkout-ul principal e folosit de alt agent; `npm install`, `npx cap add`, `next build` acolo l-ar strica (session-state notează deja că `next build` dărâmă un `next dev` din același folder).
2. **Felia cea mai mică întâi.** T0 se termină cu o singură captură: fluxul personei Andrei în APK, pe emulator. Nimic altceva nu începe până Andrei nu vede captura.
3. **Gata înseamnă arătat.** Fiecare tichet se închide cu: captura numită în tichet, comparată cu referința (`mockup/v3/index.html?v=f` pe telefon, capturile `captures/flux-00-ref-v3f-*`), lista de diferențe și o linie „Neverificat:”. Fără captură nu există „gata”.
4. **Un commit per tichet** pe `android`, cu captura în `captures/` și mesajul în română. Push pe `origin/android` după fiecare tichet. PR spre `main` la final, cu skill-ul `pr`, reviewer Andrei. Nu se face merge în `main` fără Andrei.
5. **Nimic inventat.** Textul notificărilor vine din `notificariLa` (`lib/notificari.ts`); sumele din catalog. Builderii nu scriu niciun lei și nicio dată de mână.
6. **Fără secrete în repo.** `google-services.json`, chei Firebase, keystore-uri: în `.gitignore`, cu fișier `.example` documentat.
7. **Un builder per tichet, tichetele în ordine.** T1 și T2 pot merge în paralel după T0, în worktree-uri separate (`android-t1`, `android-t2` din `android`) și se integrează de Astra, pentru că ating fișiere diferite (vezi fiecare tichet). T3 după T1+T2. T4 doar când Andrei livrează Firebase.
8. **Blocaj = întrebare pentru Andrei, nu presupunere.** Dacă un tichet cere ceva ce nu e în repo (cont, cheie, decizie de produs), Astra scrie întrebarea în raport și trece la următorul tichet neblocat.

## 2. Mediul de pe laptop (verificat 29 oct 2026, 05:20)

| Ce | Unde / valoare |
|---|---|
| Android SDK | `%LOCALAPPDATA%\Android\Sdk` (`ANDROID_HOME`, `ANDROID_SDK_ROOT` setate la nivel de utilizator) |
| Pe PATH (utilizator) | `platform-tools` (adb 1.0.41), `emulator` (37.2), `cmdline-tools\latest\bin` |
| Platforme / build-tools | android-34, android-36 / 34.0.0, 35.0.0, 36.0.0, 36.1.0 |
| Imagine de sistem | `system-images;android-36;google_apis;x86_64` |
| AVD-uri | `Pixel_6_API36_gpu` (GPU host pe RTX 4050, 3 GB RAM, tastatură; **folosește-l pe acesta**), `Voices_Test_API36` (vechi, GPU oprit) |
| Accelerare | WHPX instalat și funcțional (Windows 10 Home 19045) |
| Java | JDK 21 Temurin = `JAVA_HOME` și primul pe PATH (mașină). JDK 17 rămâne instalat. șablonul Capacitor 8 s-a construit aici cu JDK 21; cerința exactă nu a fost citită din docs |
| Android Studio | `C:\Program Files\Android\Android Studio` (2026.2.2). Nu e necesar pentru build; util pentru Andrei |
| Node / npm | 24.18 / 11.16 (Capacitor 8 cere Node ≥ 22) |
| Capacitor (npm, 29 oct) | core/cli/android 8.6.0; local-notifications 8.3.1; push-notifications 8.1.3; app 8.1.2; status-bar 8.0.4; splash-screen 8.0.2; browser 8.0.5 |
| Gradle din șablonul Capacitor 8 | wrapper 8.14.3, compileSdk 36, targetSdk 36, minSdk 24 |

Terminalele și sesiunile Codex deschise **înainte de 29 oct 05:00 nu văd variabilele noi**; repornește-le.

Dovezi: `captures/android-emulator-gpu-home.png` (ecranul de blocare Android 16 după boot, 37 s), `captures/android-01-capacitor-proba-serverurl.png` (APK de probă Capacitor 8 construit cu Gradle 8.14.3 pe acest laptop în 1 min 42 s, instalat în emulator, care încarcă pagina de pe laptop prin `server.url` = `http://10.0.2.2:3200` cu `cleartext`, adică exact calea din T0; proiectul de probă e în afara repo-ului. Observat în captură: bara de stare rămâne albă peste pagina închisă, deci T1 e necesar).

### Comenzi pe care le dai builderilor

```powershell
# emulator pentru builderi (fără fereastră), din orice folder
emulator -avd Pixel_6_API36_gpu -no-window -no-audio -no-boot-anim -no-snapshot
adb wait-for-device; adb shell getprop sys.boot_completed     # „1” = gata (≈40 s)

# emulator pentru pitch (cu fereastră, pe ecranul lui Andrei)
emulator -avd Pixel_6_API36_gpu

# dev server pentru WebView (port 3200: 3000 și 3100 sunt luate de alte sesiuni pe acest laptop)
cd .claude\worktrees\android; npm install; npm run dev -- -p 3200

# build + instalare + pornire + captură
npx cap sync android
cd android; .\gradlew.bat assembleDebug; cd ..
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n ro.ceinseamna.app/.MainActivity
adb exec-out screencap -p > captures\android-<tichet>-<ce>.png
adb logcat -d | Select-String -Pattern "Capacitor|chromium|AndroidRuntime" | Select-Object -Last 40

# notificări: deschide panoul, apoi captură; apasă pe prima notificare
adb shell cmd statusbar expand-notifications
adb shell input tap 540 600

# telefon fizic pe USB (depanare USB pornită): dev server-ul de pe laptop devine localhost pe telefon
adb reverse tcp:3200 tcp:3200

# oprire emulator
adb emu kill
```

Capturi din emulator: `adb exec-out screencap` dă 1080×2400. Pentru comparație cu referința de 375 px, inspectorul scalează mental; nu se cer capturi la 375 px din Android.

## 3. Decizii fixe (din ADR 0005)

- Capacitor 8 peste aplicația Next.js, `android/` generat și commitat.
- `server.url` din variabila `CAP_SERVER_URL`, implicit `http://10.0.2.2:3200` (emulator → laptop), `cleartext: true` cât timp e HTTP. `www/` conține doar pagina „Fără conexiune”.
- Notificare locală din `notificariLa`; FCM e T4, blocat de Firebase.
- Pe telefon se demonstrează notificare → flux → card → „Arată-mi legea”. Google și Stripe se demonstrează pe web (OAuth e refuzat în WebView).
- Id aplicație: `ro.ceinseamna.app`. Nume afișat: „Ce înseamnă pentru mine”.

## 4. Tichete

Forma e cea din `docs/echipa/README.md`: ce construiești, fișiere, criterii de acceptare, verificare, captură, blocat de.

### T0. Scheletul: APK-ul arată fluxul personei Andrei

**Ce construiești.** Capacitor adăugat în proiect, WebView-ul încarcă `next dev` de pe laptop, APK-ul merge în emulator.

**Înainte de orice.** Worktree-ul e curat: `npm install` în `.claude/worktrees/android` (nu există `node_modules`). `/flux?p=andrei` nu citește nicio variabilă de mediu (Supabase e folosit doar în `/admin` și `lib/interpretare.ts`), deci T0 nu are nevoie de `.env.local`; nu-l copia și nu-l commita.

**Fișiere.**
- `package.json`: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` (8.x); scripturi `android:sync` (`cap sync android`), `android:apk` (`cap sync android && cd android && gradlew.bat assembleDebug`), `android:run` (instalare + `am start`).
- `capacitor.config.ts`: `appId: 'ro.ceinseamna.app'`, `appName: 'Ce înseamnă pentru mine'`, `webDir: 'www'`, `server: { url: process.env.CAP_SERVER_URL ?? 'http://10.0.2.2:3200', cleartext: true }`. Dacă `CAP_SERVER_URL` e gol (șir vid), fără `server`, ca APK-ul să arate `www/`.
- `www/index.html`: pagina „Fără conexiune” în stilul v3 F (gri, Inter), un buton „Reîncearcă” (`location.reload()`), RO și EN după `navigator.language`.
- `next.config.ts`: `allowedDevOrigins: ['10.0.2.2', 'localhost']` (Next 15.5 blochează altfel cererile dev din WebView).
- `android/` generat de `npx cap add android`, commitat; `.gitignore` din șablon acoperă `build/`, `.gradle/`, `local.properties`. Adaugă în `.gitignore` din rădăcină: `android/app/google-services.json`, `*.keystore`, `*.jks`.
- `AGENTS.md`: aliniat la `CLAUDE.md` (aceleași decizii și reguli, cu `.claude/session-state.md` și `.claude/skills/`), plus o linie care trimite la acest plan.
- `docs/android/README.md`: cum pornești (dev server, emulator, build, telefon pe USB), 20 de rânduri.

**Criterii de acceptare.**
- `npm run android:apk` produce `android/app/build/outputs/apk/debug/app-debug.apk` fără erori.
- Cu `npm run dev -- -p 3200` pornit, APK-ul instalat în `Pixel_6_API36_gpu` arată `/flux?p=andrei` (lista cu IT −520 lei/lună sus), fonturile Inter/Raleway încărcate, fără bara de adresă.
- Cu dev server-ul oprit, APK-ul arată pagina „Fără conexiune”, nu eroarea Chromium.
- `npm test`, `npm run typecheck` trec ca înainte (97 de teste pe `main` la 29 oct).

**Verificare.** Comenzile din secțiunea 2. Captură: `captures/android-T0-flux-andrei.png`, plus `captures/android-T0-offline.png`. Referință: `captures/flux-00-ref-v3f-*`.

**Blocat de.** Nimic. **Aici te oprești și îi arăți lui Andrei captura** înainte de T1–T3.

### T1. Arată ca o aplicație, nu ca o pagină

**Ce construiești.** Tot ce trădează WebView-ul: bara de stare, marginile, butonul înapoi, link-urile externe, pictograma, splash-ul.

**Fișiere.**
- `components/InvelisNativ.tsx` (client, montat în `app/layout.tsx`): rulează doar când `Capacitor.isNativePlatform()`; import dinamic al plugin-urilor ca bundle-ul web să nu le care.
  - Bara de stare urmează `data-theme` de pe `<html>` (observă atributul; `StatusBar.setStyle` + `setBackgroundColor` cu culorile din `app/globals.css`: fundalul temei).
  - Butonul înapoi (`@capacitor/app`, `backButton`): `history.back()` dacă există istoric, altfel `App.exitApp()`.
  - Link-urile cu `target="_blank"` sau către alt domeniu se deschid cu `@capacitor/browser` (Custom Tab), nu în WebView.
- Edge-to-edge (targetSdk 36): verifică în docs Capacitor 8 opțiunea `android.adjustMarginsForEdgeToEdge`; dacă nu ajunge, `padding-top: env(safe-area-inset-top)` pe antet (`viewport-fit=cover` în `app/layout.tsx`).
- `android/app/src/main/res/`: pictogramă adaptivă (fundal gri șobolan din v3 F, simbol simplu: semnul „lei” sau o paranteză de lege; fără text), splash cu același fundal și numele aplicației (`@capacitor/splash-screen`, `launchAutoHide` după ce pagina a încărcat).
- `android/app/src/main/res/values/strings.xml`: `app_name` = „Ce înseamnă pentru mine”.
- Dezactivează zoom-ul cu două degete și selecția lungă pe text care nu e conținut (`user-scalable=no` doar în nativ, altfel accesibilitatea pe web suferă).

**Criterii de acceptare.**
- Captura în tema deschisă și în cea închisă: bara de stare are culoarea fundalului, textul orei lizibil, antetul nu e sub bara de stare.
- Înapoi din card → listă → ieșire din aplicație, fără ecran alb.
- Atingerea „Arată-mi legea” → link-ul legislatie.just.ro se deschide în Custom Tab, cu butonul ✕ al Chrome-ului; revenirea păstrează poziția în listă.
- În lista de aplicații: pictograma și numele corect; splash-ul fără flash alb înainte de pagină.

**Verificare.** Capturi: `captures/android-T1-flux-light.png`, `-dark.png`, `-customtab.png`, `-launcher.png` (`adb shell input keyevent KEYCODE_HOME` apoi `adb shell monkey -p ro.ceinseamna.app 1` pentru relansare). Referință: v3 F telefon.

**Blocat de.** T0. Fișiere diferite de T2 (T2 nu atinge `InvelisNativ.tsx`; își pune ascultătorul în `components/NotificariNative.tsx`).

### T2. Notificarea pe ecranul blocat

**Ce construiești.** Notificarea locală din `notificariLa`, cu permisiune cerută la prima deschidere, și atingerea care deschide cardul.

**Fișiere.**
- `components/NotificariNative.tsx` (client): doar în nativ. La prima deschidere cere `LocalNotifications.requestPermissions()` după un text scurt în pagină („Îți spunem când apare o lege care îți schimbă banii”; RO/EN din `lib/i18n.ts`). Programează notificările din `notificariLa(potriviri, azi, limba)` pentru persona/profilul curent: titlu = `titlu`, text = `mesaj`, `extra: { id }`. `localNotificationActionPerformed` → `router.push('/flux?go=<id>')`.
- `app/flux/page.tsx` sau `components/ListaFlux.tsx`: parametrul `go=<id>` derulează la rând și îl deschide (dacă nu există deja; în mockup-ul v6 există `?go=`).
- Buton de demo „Trimite notificarea pe telefon” în `/notificare` (componenta `PrevizualizareNotificari.tsx`), vizibil doar în nativ: programează notificarea aleasă peste 5 secunde. Pentru pitch: apeși, blochezi ecranul, notificarea apare.
- `android/app/src/main/AndroidManifest.xml`: `POST_NOTIFICATIONS` (plugin-ul o adaugă; verifică). Pictograma mică de notificare monocromă în `res/drawable`.

**Criterii de acceptare.**
- Textul notificării e identic cu rândul din `/notificare` pentru aceeași persoană și dată (nu scris în componentă).
- Pe ecranul blocat: titlul și prima linie a mesajului, pictograma aplicației, fără „Chrome” nicăieri.
- Atingerea deschide aplicația pe cardul respectiv, deschis.
- Fără permisiune acordată: aplicația merge, butonul explică de ce nu apare notificarea.

**Verificare.** `adb shell cmd statusbar expand-notifications` → `captures/android-T2-panou.png`; `adb shell input keyevent KEYCODE_SLEEP` + `KEYCODE_WAKEUP` → `captures/android-T2-lockscreen.png`; după atingere → `captures/android-T2-card-deschis.png`. Test unitar pentru funcția care transformă `Notificare[]` în `ScheduleOptions` (pură, în `lib/notificari-native.ts`).

**Blocat de.** T0.

### T3. Pitch pe telefon fizic și scenariul de 60 de secunde

**Ce construiești.** Tot ce trebuie ca Andrei să arate aplicația pe un telefon real, fără emulator.

**Fișiere.**
- `scripts/android-telefon.ps1`: `adb reverse tcp:3200 tcp:3200`, instalare APK, pornire; mesaje clare când nu e niciun telefon conectat.
- `docs/android/README.md`: secțiunea „Scenariu pitch” (60 s): deschide `/notificare`, buton „Trimite”, blochează ecranul, notificarea apare, atinge → card → „Arată-mi legea” → Custom Tab. Plus planul B: emulatorul cu fereastră pe laptop, proiectat.
- APK semnat cu un keystore de debug generat local (nu în repo), ca să se poată instala pe orice telefon: `npm run android:apk` ajunge.

**Criterii de acceptare.** Scenariul rulează cap-coadă pe emulatorul cu fereastră în sub 60 s; pe telefon fizic la fel, cu `adb reverse` (Astra nu poate verifica telefonul fizic; linia „Neverificat: telefon fizic” rămâne până îl confirmă Andrei).

**Blocat de.** T1, T2.

### T4. Push real prin Firebase (extindere)

**Ce construiești.** `@capacitor/push-notifications` + FCM, cu un script de pe laptop care trimite notificarea pe telefon în timpul pitch-ului, cu aplicația închisă.

**Fișiere.**
- `android/app/google-services.json` (ignorat; `google-services.json.example` cu câmpurile goale), plugin Google Services în `android/build.gradle` și `android/app/build.gradle`.
- `components/NotificariNative.tsx`: înregistrare, token-ul scris în `localStorage` și în logcat (`adb logcat -s Capacitor/Push`), nu trimis nicăieri încă.
- `scripts/push-trimite.mjs`: `firebase-admin` cu `FIREBASE_SERVICE_ACCOUNT_JSON` din `.env.local`; argumente: token, persoană, dată; payload din `notificariLa`. Fără server în repo; e un script.
- `.env.example`: variabilele noi, cu explicația „doar pe laptop, niciodată în browser”.

**Criterii de acceptare.** Cu aplicația închisă, `node scripts/push-trimite.mjs <token> andrei 2026-10-28` face să apară notificarea în 5 s; atingerea deschide cardul.

**Blocat de.** T2 și **Andrei: proiect Firebase** (aplicație Android `ro.ceinseamna.app`, `google-services.json`, cont de serviciu). Până atunci tichetul nu se începe.

### T5. (opțional, nu în prima rundă) Conectare Google în Custom Tab

Doar dacă Andrei vrea Pro demonstrat pe telefon. Auth.js prin `@capacitor/browser` + App Link înapoi (`https://…/api/auth/callback`), cookie-ul de sesiune trebuie adus în WebView. Cere instanță publică HTTPS. Astra nu îl programează fără decizia lui Andrei.

## 5. Riscuri cunoscute

- **Laptopul e serverul.** Fără `next dev` pe 3200, aplicația arată „Fără conexiune”. Scenariul de pitch pornește cu verificarea dev server-ului.
- **Fonturile Google** se încarcă din rețea (decizia din `app/layout.tsx`); pe emulator merg, pe telefon fără date mobile nu. Fallback-ul CSS e system-ui; acceptabil.
- **`next build` în același folder cu `next dev`** strică dev server-ul; builderii nu rulează `next build` în worktree-ul cu dev server-ul pornit.
- **Data demo.** Aplicația folosește `azi = 2026-10-28` implicit; emulatorul are data reală. Notificările se programează cu „peste 5 secunde”, nu cu termenele din catalog.
- **Edge-to-edge pe Android 15+** poate pune antetul sub bara de stare; e criteriu în T1, nu surpriză.
- **Portul 3000** e folosit de alte sesiuni; de aceea 3200.

## 6. Ce raportează Astra lui Andrei

După T0 și după fiecare tichet: captura, referința, diferențele, „Neverificat:”, commit-ul. La final: PR `android` → `main` cu descrierea din skill-ul `pr`, lista tichetelor închise, întrebările deschise (Firebase, telefon fizic, T5), și o secțiune nouă în `.claude/session-state.md`.
