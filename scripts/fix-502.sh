#!/usr/bin/env bash
# Paste on the server to recover from 502 / broken assets.
set -euo pipefail
cd /opt/tmp-app

echo "==> git pull"
git pull --ff-only || git pull

echo "==> container status (before)"
docker compose -p tmpapp --env-file .env.prod ps -a || true

echo "==> last api logs"
docker compose -p tmpapp --env-file .env.prod logs --tail=120 api || true

echo "==> rebuild api without cache (SSL fix must land in dist/)"
docker compose -p tmpapp --env-file .env.prod build --no-cache api
docker compose -p tmpapp --env-file .env.prod up -d --force-recreate api web gateway

echo "==> wait for api"
for i in $(seq 1 60); do
  if docker compose -p tmpapp --env-file .env.prod exec -T api wget -qO- http://127.0.0.1:3000/api >/dev/null 2>&1 \
    || docker compose -p tmpapp --env-file .env.prod exec -T api node -e "fetch('http://127.0.0.1:3000/api').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "api ok"
    break
  fi
  sleep 2
done

echo "==> status (after)"
docker compose -p tmpapp --env-file .env.prod ps -a

echo "==> nginx config check (must contain location /api/)"
grep -n 'location /api' deploy/nginx.tmpapp.conf || echo 'MISSING /api location — pull failed?'

echo "==> reload gateway nginx"
docker compose -p tmpapp --env-file .env.prod exec -T gateway nginx -s reload || \
  docker compose -p tmpapp --env-file .env.prod restart gateway

echo "==> probes"
curl -sI http://127.0.0.1:8080/tours | head -3
curl -sI http://127.0.0.1:8080/api/tours | head -5
curl -s http://127.0.0.1:8080/api/tours?limit=1 | head -c 300; echo
curl -sI http://127.0.0.1:8080/uploads/ | head -5

echo "==> seed (safe to re-run)"
docker compose -p tmpapp --env-file .env.prod exec -T api npm run seed || true

echo "Done. Open http://5.42.114.140:8080"
