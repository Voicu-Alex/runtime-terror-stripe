# Deploy: descriere.andreidobrin.com

## Aplicația Next.js (29 octombrie 2026)

Domeniul servește acum aplicația Next.js din CT 107, prin Nginx → `127.0.0.1:3000`.
Pagina statică de descriere rămâne la `/descriere.html` (și `/index.html`), iar PDF-ul la adresa existentă.

- Serviciu: `descriere-app.service`, utilizator fără login `descriere-app`; pornește automat la boot.
- Cod: `/opt/descriere-app/current` → `/opt/descriere-app/releases/<commit>`.
  Aplicația și descrierea urmăresc **`main`**. La fiecare 3 minute,
  poller-ul descarcă branch-ul, instalează dependențele ca utilizatorul aplicației, rulează testele
  și build-ul, apoi schimbă versiunea activă și repornește serviciul. Un build eșuat păstrează
  versiunea curentă și curăță candidatul; un health check eșuat restaurează versiunea anterioară.
  Se păstrează ultimele două versiuni. `.deploy-sha` identifică sursa build-ului activ.
- Node 24: `/opt/nodejs/current`. Resurse CT: 2 vCPU, 2 GB RAM, 1 GB swap, disc 6 GB.
- Secrete: `/etc/descriere-app/.env.local`, proprietar `root:descriere-app`, permisiuni `640`;
  fișierul este în afara rădăcinii web și legat în directorul aplicației. Nu se pune în repo.
  După actualizare: `pct exec 107 -- systemctl restart descriere-app`.
  Schimbarea unei variabile `NEXT_PUBLIC_*` cere și un nou build.
- Configurate și verificate din CT: Anthropic, Supabase API și Postgres. CA-ul Supabase este în
  `/etc/descriere-app/prod-ca-2021.crt`; `SUPABASE_DB_CA` și `NODE_EXTRA_CA_CERTS` indică acest fișier.
- Google OAuth (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) și Stripe în modul test
  (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) au fost copiate din `.env.local` și încărcate
  prin repornirea serviciului. Endpoint-ul Stripe este activ și are cele opt evenimente de
  checkout, abonament și factură selectate. Cererile semnate de test sunt acceptate, iar
  semnăturile invalide sunt respinse; redirectul Google folosește clientul și callback-ul corecte.
  Conectarea completă cu Google a fost verificată în browser. O livrare de test pornită din
  Stripe și checkout-ul complet sunt verificări separate. `STRIPE_PRICE_ID` rămâne opțional
  (codul descrie prețul la checkout). URL-urile de întoarcere din checkout și portal folosesc
  `AUTH_URL`, ca proxy-ul să nu trimită utilizatorul la localhost.
  Lista `ADMIN_EMAILS` nu este configurată; aprobarea actelor rămâne închisă în producție.
  Callback Google: `https://descriere.andreidobrin.com/api/auth/callback/google`.
  Webhook Stripe: `https://descriere.andreidobrin.com/api/stripe/webhook`.
- Verificare: 206 teste, build de producție, conexiune Postgres cu certificat verificat,
  rute publice și o analiză Claude prin endpoint-ul public, cu factura fictivă din `test-docs/`.

Configul Nginx anterior este păstrat în `/etc/nginx/descriere-static.before-next.conf`.
Pentru revenire la pagina statică, restaurează acest fișier peste ținta legăturii
`/etc/nginx/sites-enabled/descriere`, verifică `nginx -t`, apoi reîncarcă Nginx.
Există și snapshotul Proxmox `pre-next-app-20261029-051639` (înaintea instalării și a măririi discului).

## Publicarea paginii statice

Același timer reconstruiește aplicația Next.js și publică fișierele din manifest după health check.

Pagina de descriere (`mockup/descriere.html` + PDF-ul provocării) se publică singură: la fiecare
3 minute containerul verifică `main` și, dacă e un commit nou, construiește aplicația
și pune fișierele din `manifest.txt` pe site. Publicarea durează și timpul necesar testelor și build-ului.

```
GitHub main <--(git ls-remote / fetch)--> CT 107 "descriere"
                                                  /opt/descriere-app/current (Next.js)
                                                  /var/www/descriere (fișiere statice)
Cloudflare -> Nginx Proxy Manager (CT 101, TLS) -> CT 107:80
```

De ce așa, nu GitHub Actions: serverul e acasă, fără porturi deschise spre GitHub, și repo-ul
nu e al nostru (fără drept de admin, deci fără secrete în Actions).

## Ce e unde

| | |
|---|---|
| Container | Proxmox `192.168.31.63` → LXC **107** `descriere` (`192.168.31.18`), Debian 13 |
| Site | `/var/www/descriere`, config nginx = `nginx.conf` de aici |
| Poller | `/usr/local/bin/descriere-deploy` (= `poll.sh`), `descriere-deploy.timer` |
| Config / cheie | `/etc/descriere-deploy/config`, `/etc/descriere-deploy/deploy_key` |
| Commit publicat | https://descriere.andreidobrin.com/version.txt |

## Operare

- **Ce se publică:** codul commitat pe `main`; `manifest.txt` descrie suplimentar fișierele statice.
- **Instalare / actualizarea scripturilor:** `./deploy/descriere/install.sh` de pe un calculator
  din rețeaua de acasă, după configurarea runtime-ului și a secretelor descrise mai sus.
  Păstrează cheia și setează branch-ul din config la `main`. Scripturile de pe server nu se
  actualizează singure din git, doar fișierele site-ului.
- **Publicare imediată:** `ssh root@192.168.31.63 'pct exec 107 -- descriere-deploy'`
  (cu `FORCE=1` republică același commit).
- **Log:** `pct exec 107 -- journalctl -u descriere-deploy -n 20`.
- **Testul poller-ului:** `python3 deploy/descriere/test-poll.py` pe Linux; verifică izolarea
  metadatelor, no-op, curățarea unui build eșuat și revenirea după un health check eșuat.
- **Rollback:** dai revert pe `main`, sau alegi versiunea precedentă din `/opt/descriere-app/releases`
  și repornești `descriere-app`. Snapshotul Proxmox poate restaura configurația inițială.

## Accesul la GitHub

Cheia containerului (`/etc/descriere-deploy/deploy_key.pub`, afișată la finalul `install.sh`) e
adăugată pe contul GitHub al lui Andrei („descriere-deploy CT107 (homelab)”, 29 oct 2026), pentru
că doar un admin al repo-ului poate adăuga o cheie de deploy. Atenție: o cheie pe cont poate
citi **și scrie** în toate repo-urile contului. După hackathon, ori se șterge din
github.com/settings/keys, ori un admin o mută în Settings → Deploy keys (doar citire).
