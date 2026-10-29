# Deploy: descriere.andreidobrin.com

Pagina de descriere (`mockup/descriere.html` + PDF-ul provocării) se publică singură: la fiecare
3 minute containerul verifică `main` și, dacă e un commit nou, pune fișierele din `manifest.txt`
pe site. Un push pe `main` apare online în cel mult ~3 minute.

```
GitHub main  <--(git ls-remote / fetch, cheie de deploy doar citire)--  CT 107 "descriere"
                                                                          /var/www/descriere (nginx)
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

- **Ce se publică:** editezi `manifest.txt` (sursă în repo → cale pe site) și dai push.
- **Instalare / actualizarea scripturilor:** `./deploy/descriere/install.sh` de pe un calculator
  din rețeaua de acasă. Nu atinge config-ul și cheia existente. Scripturile de pe server nu se
  actualizează singure din git, doar fișierele site-ului.
- **Publicare imediată:** `ssh root@192.168.31.63 'pct exec 107 -- descriere-deploy'`
  (cu `FORCE=1` republică același commit).
- **Log:** `pct exec 107 -- journalctl -u descriere-deploy -n 20`.
- **Rollback:** dai revert pe `main`, sau `pct rollback 107 <snapshot>`.

Cheia de deploy se adaugă în GitHub → repo → Settings → Deploy keys (doar citire); cheia publică
se afișează la finalul `install.sh`. Doar un admin al repo-ului o poate adăuga.
