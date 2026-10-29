#!/usr/bin/env bash
#
# Rulează în CT 107 "descriere", pornit de descriere-deploy.timer la fiecare 3 minute.
# Testează și construiește branch-ul configurat, apoi schimbă versiunea activă a aplicației.
#
#   descriere-deploy          # publică doar dacă branch-ul s-a schimbat
#   FORCE=1 descriere-deploy  # publică din nou commit-ul curent
#
# Configurarea: /etc/descriere-deploy/config (REPO_URL, BRANCH, WEBROOT, SSH_KEY).

set -euo pipefail

CONFIG=/etc/descriere-deploy/config
STATE=/var/lib/descriere-deploy
REPO_URL="git@github.com:Voicu-Alex/runtime-terror-stripe.git"
BRANCH=main
WEBROOT=/var/www/descriere
APP_ROOT=/opt/descriere-app
APP_ENV=/etc/descriere-app/.env.local
NODE_BIN=/opt/nodejs/current/bin
SSH_KEY=/etc/descriere-deploy/deploy_key
[ -f "$CONFIG" ] && . "$CONFIG"

die() { echo "EROARE: $*" >&2; exit 1; }

mkdir -p "$STATE"
exec 9>"$STATE/lock"
flock -n 9 || { echo "alt deploy rulează deja"; exit 0; }

# Cheia GitHub e fixată (github.com/meta), nu acceptată la prima conectare.
export GIT_SSH_COMMAND="ssh -i $SSH_KEY -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=/etc/descriere-deploy/known_hosts"

sha="$(git ls-remote "$REPO_URL" "refs/heads/$BRANCH" | cut -f1)"
[ -n "$sha" ] || die "nu găsesc refs/heads/$BRANCH în $REPO_URL"

if [ "${FORCE:-0}" != 1 ] && [ "$sha" = "$(cat "$STATE/deployed-sha" 2>/dev/null || true)" ] &&
   [ "$sha" = "$(cat "$APP_ROOT/current/.deploy-sha" 2>/dev/null || true)" ]; then
  exit 0
fi

repo="$STATE/repo"
[ -d "$repo/.git" ] || git init -q "$repo"
git -C "$repo" fetch -q --depth 1 "$REPO_URL" "refs/heads/$BRANCH"
fetched="$(git -C "$repo" rev-parse FETCH_HEAD)"
[ "$fetched" = "$sha" ] || sha="$fetched"

[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || die "commit invalid"
[ -r "$APP_ENV" ] || die "lipsește $APP_ENV"
[ -x "$NODE_BIN/node" ] || die "lipsește Node 24 în $NODE_BIN"
# Directoarele care pot fi șterse sunt fixate aici, înainte de orice ștergere.
[ "$APP_ROOT" = /opt/descriere-app ] && [ "$WEBROOT" = /var/www/descriere ] || die "rădăcină neașteptată"
previous="$(readlink -f "$APP_ROOT/current")"
release="$APP_ROOT/releases/$sha"
if [ "$previous" = "$release" ]; then release="$release-$(date +%Y%m%d%H%M%S)"; fi
cleanup() {
  status=$?
  trap - EXIT
  if [ "$status" -ne 0 ] && [ "$(readlink -f "$APP_ROOT/current")" != "$release" ]; then
    rm -rf -- "$release"
  fi
  exit "$status"
}
trap cleanup EXIT

if [ -d "$release" ]; then rm -rf -- "$release"; fi
mkdir -p "$release"
git -C "$repo" archive "$sha" | tar -x -C "$release" --no-same-owner
[ ! -e "$release/.env.local" ] || die ".env.local nu trebuie publicat în Git"
rm -f -- "$release/.deploy-sha"
printf '%s\n' "$sha" > "$release/.deploy-sha"
chown -R descriere-app:descriere-app "$release"
ln -s "$APP_ENV" "$release/.env.local"
runuser -u descriere-app -- env PATH="$NODE_BIN:/usr/bin:/bin" NEXT_TELEMETRY_DISABLED=1 \
  NODE_EXTRA_CA_CERTS=/etc/descriere-app/prod-ca-2021.crt \
  bash -c 'cd "$1" && npm ci --no-audit --no-fund && npm test && npm run build' bash "$release"

new="$WEBROOT.new"
rm -rf "$new" "$WEBROOT.old"
mkdir -p "$new"

count=0
while read -r src dst; do
  case "$src" in ''|'#'*) continue ;; esac
  [ -n "$dst" ] || die "linie fără destinație în manifest: $src"
  case "$dst" in /*|*..*) die "destinație nepermisă: $dst" ;; esac
  mkdir -p "$new/$(dirname "$dst")"
  git -C "$repo" show "$sha:$src" > "$new/$dst" || die "lipsește $src în $sha"
  count=$((count + 1))
done < <(git -C "$repo" show "$sha:deploy/descriere/manifest.txt")

[ "$count" -gt 0 ] || die "manifestul nu publică nimic"
grep -qi '<html' "$new/index.html" 2>/dev/null || die "index.html lipsește sau nu e HTML"
echo "$sha" > "$new/version.txt"

chmod -R u=rwX,go=rX "$new"

ln -sfn "$release" "$APP_ROOT/current"
healthy() {
  "$NODE_BIN/node" --input-type=module <<'JS'
for (let i = 0; i < 30; i++) {
  try {
    const r = await fetch('http://127.0.0.1:3000/flux', {
      headers: { Host: 'descriere.andreidobrin.com' }, signal: AbortSignal.timeout(3000),
    });
    if (r.status === 200) process.exit(0);
  } catch {}
  await new Promise(resolve => setTimeout(resolve, 1000));
}
process.exit(1);
JS
}
if ! systemctl restart descriere-app || ! healthy; then
  ln -sfn "$previous" "$APP_ROOT/current"
  systemctl restart descriere-app
  die "health check eșuat; am restaurat versiunea anterioară"
fi

[ -d "$WEBROOT" ] && mv "$WEBROOT" "$WEBROOT.old"
mv "$new" "$WEBROOT"
rm -rf "$WEBROOT.old"

echo "$sha" > "$STATE/deployed-sha"
# Păstrăm versiunea activă și precedenta, ca instalările repetate să nu umple discul.
while IFS= read -r -d '' old; do
  [ "$old" = "$release" ] || [ "$old" = "$previous" ] || rm -rf -- "$old"
done < <(find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -print0)

echo "publicat $BRANCH@$sha (Next.js + $count fișiere statice)"
