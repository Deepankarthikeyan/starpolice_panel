#!/usr/bin/env bash
# Keep API tunnel alive and sync Netlify proxy when the URL changes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLOUDFLARED="${CLOUDFLARED:-/tmp/cloudflared}"
LOG="/tmp/api-tunnel.log"
NETLIFY_TOML="$ROOT/netlify.toml"
CURRENT_URL=""

ensure_mongo() {
  if ! pgrep -x mongod >/dev/null 2>&1; then
    sudo mkdir -p /data/db
    sudo mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /var/log/mongod.log
  fi
}

ensure_api() {
  if ! curl -sf http://127.0.0.1:5000/api/health >/dev/null 2>&1; then
    tmux -f /exec-daemon/tmux.portal.conf has-session -t starpolice-api 2>/dev/null \
      || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s starpolice-api -c "$ROOT/server" -- bash -lc 'npm start'
    sleep 3
  fi
}

start_tunnel() {
  tmux -f /exec-daemon/tmux.portal.conf has-session -t starpolice-api-tunnel 2>/dev/null \
    || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s starpolice-api-tunnel -c "$ROOT" -- bash -l
  tmux -f /exec-daemon/tmux.portal.conf send-keys -t starpolice-api-tunnel:0.0 C-c
  sleep 1
  tmux -f /exec-daemon/tmux.portal.conf send-keys -t starpolice-api-tunnel:0.0 \
    "$CLOUDFLARED tunnel --url http://127.0.0.1:5000 2>&1 | tee $LOG" C-m
  for _ in $(seq 1 20); do
    URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG" | tail -1)
    if [ -n "$URL" ] && curl -sf "$URL/api/health" >/dev/null 2>&1; then
      echo "$URL"
      return 0
    fi
    sleep 1
  done
  return 1
}

update_netlify_proxy() {
  local url="$1"
  sed -i -E "s|https://[a-z0-9-]+\.trycloudflare\.com|$url|g" "$NETLIFY_TOML"
  cd "$ROOT/package"
  npx netlify deploy --prod --dir=dist --message "Update API tunnel URL" >/tmp/netlify-deploy.log 2>&1 || true
}

ensure_mongo
ensure_api

while true; do
  if [ -z "$CURRENT_URL" ] || ! curl -sf "$CURRENT_URL/api/health" >/dev/null 2>&1; then
    echo "$(date -Is) Restarting API tunnel..."
    CURRENT_URL=$(start_tunnel) || { sleep 30; continue; }
    echo "$(date -Is) Tunnel live: $CURRENT_URL"
    update_netlify_proxy "$CURRENT_URL"
  fi
  sleep 45
done
