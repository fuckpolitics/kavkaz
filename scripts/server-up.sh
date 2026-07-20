#!/usr/bin/env bash
set -euo pipefail

# Run on the server from /opt/tmp-app
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PUBLIC_IP="${PUBLIC_IP:-5.42.114.140}"
PUBLIC_PORT="${PUBLIC_PORT:-8080}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-tmpapp}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://${PUBLIC_IP}:${PUBLIC_PORT}}"
ENV_FILE="${ENV_FILE:-.env.prod}"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f .env.prod.example ]]; then
    cp .env.prod.example "$ENV_FILE"
  else
    touch "$ENV_FILE"
  fi
  DB_PASSWORD="$(openssl rand -hex 16)"
  JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
  JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
DB_DATABASE=kavkaz
DB_USERNAME=kavkaz
DB_PASSWORD=${DB_PASSWORD}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
CORS_ORIGIN=http://${PUBLIC_IP}:${PUBLIC_PORT},http://${PUBLIC_IP},http://localhost:${PUBLIC_PORT}
PUBLIC_BASE_URL=${PUBLIC_BASE_URL}
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_MIGRATIONS_RUN=false
EOF
  echo "Created ${ENV_FILE} with generated secrets"
else
  grep -q '^PUBLIC_BASE_URL=' "$ENV_FILE" || echo "PUBLIC_BASE_URL=${PUBLIC_BASE_URL}" >> "$ENV_FILE"
  echo "Keeping existing ${ENV_FILE}"
fi

ufw allow "${PUBLIC_PORT}/tcp" || true

docker compose -p "$COMPOSE_PROJECT" --env-file "$ENV_FILE" up -d --build

echo "==> Waiting for gateway"
for i in $(seq 1 90); do
  if curl -fsS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PUBLIC_PORT}/" | grep -Eq '200|301|302|307|308'; then
    echo "Gateway up"
    break
  fi
  sleep 2
done

echo "==> Seed"
docker compose -p "$COMPOSE_PROJECT" --env-file "$ENV_FILE" exec -T api npm run seed \
  || echo "Seed failed — run: docker compose -p ${COMPOSE_PROJECT} --env-file ${ENV_FILE} exec api npm run seed"

echo ""
echo "Check: curl -sI http://127.0.0.1:${PUBLIC_PORT} | head -3"
echo "Public: ${PUBLIC_BASE_URL}"
echo "Stop:   docker compose -p ${COMPOSE_PROJECT} --env-file ${ENV_FILE} down"
