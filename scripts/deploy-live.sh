#!/usr/bin/env bash
# Quick free live hosting via Cloudflare tunnels (no Netlify/Render account needed).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLOUDFLARED="${CLOUDFLARED:-/tmp/cloudflared}"

if ! command -v mongod >/dev/null 2>&1; then
  echo "MongoDB is required. Install mongodb-org or start MongoDB Atlas and set MONGODB_URI."
  exit 1
fi

if ! pgrep -x mongod >/dev/null 2>&1; then
  sudo mkdir -p /data/db
  sudo mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /var/log/mongod.log
fi

if [ ! -f "$ROOT/server/.env" ]; then
  cp "$ROOT/server/.env.example" "$ROOT/server/.env"
fi

cd "$ROOT/server"
npm install
npm run seed

npm start &
API_PID=$!
sleep 2

"$CLOUDFLARED" tunnel --url http://127.0.0.1:5000 2>&1 | tee /tmp/starpolice-api-tunnel.log &
TUNNEL_API_PID=$!
sleep 5
API_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/starpolice-api-tunnel.log | head -1)

cd "$ROOT/package"
VITE_API_URL="$API_URL" npm ci
VITE_API_URL="$API_URL" npm run build
npx vite preview --host 0.0.0.0 --port 4173 &
WEB_PID=$!
sleep 2

"$CLOUDFLARED" tunnel --url http://127.0.0.1:4173 2>&1 | tee /tmp/starpolice-web-tunnel.log &
TUNNEL_WEB_PID=$!
sleep 5
WEB_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/starpolice-web-tunnel.log | head -1)

echo ""
echo "=========================================="
echo "  Star Police Academy is LIVE"
echo "=========================================="
echo "  Website:  $WEB_URL"
echo "  API:      $API_URL"
echo "  Login:    $WEB_URL/admin/login"
echo "  User:     superadmin@starpolice.academy / superadmin123"
echo "=========================================="
echo "Press Ctrl+C to stop."

wait
