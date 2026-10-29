#!/usr/bin/env bash
#
# Rulează în CT 107 "descriere", pornit de descriere-deploy.timer la fiecare 3 minute.
# Dacă main are un commit nou, publică fișierele din manifest.txt în /var/www/descriere.
#
#   descriere-deploy          # publică doar dacă main s-a schimbat
#   FORCE=1 descriere-deploy  # publică din nou commit-ul curent
#
# Configurarea: /etc/descriere-deploy/config (REPO_URL, BRANCH, WEBROOT, SSH_KEY).

set -euo pipefail

CONFIG=/etc/descriere-deploy/config
STATE=/var/lib/descriere-deploy
REPO_URL="git@github.com:Voicu-Alex/runtime-terror-stripe.git"
BRANCH=main
WEBROOT=/var/www/descriere
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

if [ "${FORCE:-0}" != 1 ] && [ "$sha" = "$(cat "$STATE/deployed-sha" 2>/dev/null || true)" ]; then
  exit 0
fi

repo="$STATE/repo"
[ -d "$repo/.git" ] || git init -q "$repo"
git -C "$repo" fetch -q --depth 1 "$REPO_URL" "refs/heads/$BRANCH"
fetched="$(git -C "$repo" rev-parse FETCH_HEAD)"
[ "$fetched" = "$sha" ] || sha="$fetched"   # main s-a mișcat între ls-remote și fetch

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
[ -d "$WEBROOT" ] && mv "$WEBROOT" "$WEBROOT.old"
mv "$new" "$WEBROOT"
rm -rf "$WEBROOT.old"

echo "$sha" > "$STATE/deployed-sha"
echo "publicat $sha ($count fișiere)"
