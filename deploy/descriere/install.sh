#!/usr/bin/env bash
#
# Instalează (sau actualizează) poller-ul în CT 107 "descriere". Se rulează de pe un calculator
# din rețeaua de acasă, care are cheia SSH pentru Proxmox:
#
#   ./deploy/descriere/install.sh
#
# Drum: acest calculator -> Proxmox host1 (SSH) -> pct push în CT 107.
# Păstrează cheia și configurarea existente; fixează branch-ul de publicare la main.

set -euo pipefail

PVE_HOST="${PVE_HOST:-192.168.31.63}"
PVE_USER="${PVE_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/dnsai_proxmox}"
CTID="${CTID:-107}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILES=(poll.sh descriere-deploy.service descriere-deploy.timer nginx.conf known_hosts)
BUNDLE="descriere-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

ssh_pve() { ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=10 "${PVE_USER}@${PVE_HOST}" "$@"; }
say() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
tar -czf "$TMP/$BUNDLE" -C "$HERE" "${FILES[@]}"
scp -i "$SSH_KEY" -o BatchMode=yes -q "$TMP/$BUNDLE" "${PVE_USER}@${PVE_HOST}:/tmp/$BUNDLE"
ssh_pve "pct push $CTID /tmp/$BUNDLE /tmp/$BUNDLE && rm -f /tmp/$BUNDLE"
say "livrat în CT $CTID"

ssh_pve "pct exec $CTID -- bash -s" <<EOF
set -euo pipefail
src=\$(mktemp -d)
tar -xzf /tmp/$BUNDLE -C \$src --no-same-owner
rm -f /tmp/$BUNDLE

command -v git >/dev/null || { apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends git openssh-client ca-certificates >/dev/null; }

install -m 755 \$src/poll.sh /usr/local/bin/descriere-deploy
install -m 644 \$src/descriere-deploy.service \$src/descriere-deploy.timer /etc/systemd/system/
install -d -m 700 /etc/descriere-deploy
install -m 644 \$src/known_hosts /etc/descriere-deploy/known_hosts

if [ ! -f /etc/descriere-deploy/config ]; then
  cat > /etc/descriere-deploy/config <<'CFG'
REPO_URL="git@github.com:Voicu-Alex/runtime-terror-stripe.git"
BRANCH=main
WEBROOT=/var/www/descriere
SSH_KEY=/etc/descriere-deploy/deploy_key
CFG
fi
sed -i 's/^BRANCH=.*/BRANCH=main/' /etc/descriere-deploy/config
[ -f /etc/descriere-deploy/deploy_key ] || ssh-keygen -q -t ed25519 -N '' -C "descriere-deploy@ct$CTID" -f /etc/descriere-deploy/deploy_key

if ! cmp -s \$src/nginx.conf /etc/nginx/sites-available/descriere; then
  cp /etc/nginx/sites-available/descriere /etc/nginx/sites-available/descriere.bak
  install -m 644 \$src/nginx.conf /etc/nginx/sites-available/descriere
  nginx -t && systemctl reload nginx
fi
rm -rf \$src

systemctl daemon-reload
systemctl enable --now descriere-deploy.timer >/dev/null
echo
echo "Cheia publică de deploy (GitHub -> repo -> Settings -> Deploy keys, doar citire):"
cat /etc/descriere-deploy/deploy_key.pub
EOF
say "instalat; timer-ul rulează la fiecare 3 minute"
