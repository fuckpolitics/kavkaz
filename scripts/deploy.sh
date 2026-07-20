#!/usr/bin/env bash
set -euo pipefail

# Deploy beside Kaishaku: only port 8080, compose project "tmpapp".
# Usage:
#   ./scripts/deploy.sh
#   ./scripts/deploy.sh root@5.42.114.140

HOST="${1:-root@5.42.114.140}"
REMOTE_DIR="${REMOTE_DIR:-/opt/tmp-app}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-tmpapp}"
PUBLIC_PORT="${PUBLIC_PORT:-8080}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Target: ${HOST}:${REMOTE_DIR} (project ${COMPOSE_PROJECT}, port ${PUBLIC_PORT})"

ssh -o BatchMode=yes -o ConnectTimeout=20 "$HOST" 'echo SSH_OK' || {
  echo ""
  echo "SSH недоступен с этой машины."
  echo "С Mac выполните:"
  echo "  rsync -avz --exclude node_modules --exclude frontend/node_modules --exclude .git --exclude dist --exclude .env --exclude frontend/.next --exclude uploads \\"
  echo "    ${ROOT_DIR}/ ${HOST}:${REMOTE_DIR}/"
  echo "  ssh ${HOST}"
  echo "  cd ${REMOTE_DIR} && bash scripts/server-up.sh"
  exit 1
}

echo "==> Ensure Docker"
ssh "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi
docker compose version
REMOTE

echo "==> Firewall 8080 (do not touch 80/443)"
ssh "$HOST" 'ufw allow OpenSSH; ufw allow 8080/tcp; ufw status | grep -E "8080|Status" || true; mkdir -p /opt/tmp-app'

echo "==> Sync"
rsync -avz --delete \
  --exclude node_modules \
  --exclude frontend/node_modules \
  --exclude frontend/.next \
  --exclude dist \
  --exclude .git \
  --exclude uploads \
  --exclude '*.log' \
  --exclude .env \
  --exclude frontend/.env.local \
  "$ROOT_DIR/" "$HOST:$REMOTE_DIR/"

echo "==> Up on server"
ssh "$HOST" "cd '$REMOTE_DIR' && PUBLIC_IP='5.42.114.140' PUBLIC_PORT='$PUBLIC_PORT' COMPOSE_PROJECT='$COMPOSE_PROJECT' bash scripts/server-up.sh"

echo ""
echo "Готово: http://5.42.114.140:${PUBLIC_PORT}"
