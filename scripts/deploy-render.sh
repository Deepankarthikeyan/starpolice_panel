#!/usr/bin/env bash
# Deploy permanent API to Render (Docker + MongoDB)
set -euo pipefail

RENDER="/tmp/render-cli2/cli_v2.22.0"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! $RENDER whoami -o text &>/dev/null; then
  echo "Not logged in to Render. Run: $RENDER login"
  echo "Then open the device authorization URL shown."
  exit 1
fi

$RENDER blueprints validate "$ROOT/render.yaml"

echo "Creating starpolice-api on Render..."
$RENDER services create \
  --confirm \
  --output json \
  --name starpolice-api \
  --type web_service \
  --repo https://github.com/Deepankarthikeyan/starpolice_panel \
  --branch master \
  --runtime docker \
  --root-directory server \
  --plan free \
  --region oregon \
  --health-check-path /api/health \
  --env-var "CLIENT_URL=https://starpolice-panel.netlify.app" \
  > /tmp/render-create.json

API_URL=$(python3 -c "import json; d=json.load(open('/tmp/render-create.json')); print(d.get('service',{}).get('serviceDetails',{}).get('url') or d.get('service',{}).get('url',''))" 2>/dev/null || true)

if [ -z "$API_URL" ]; then
  echo "Service may already exist. Fetching..."
  API_URL="https://starpolice-api.onrender.com"
fi

echo "Render API URL: $API_URL"
echo "Waiting for deploy (may take 5-10 min on free tier)..."
$RENDER deploys create --confirm --wait -o text starpolice-api 2>/dev/null || true

for i in $(seq 1 30); do
  if curl -sf "$API_URL/api/health" >/dev/null 2>&1; then
    echo "API is live at $API_URL"
    break
  fi
  sleep 20
done

echo "Updating Netlify to use permanent Render API..."
cd "$ROOT"
sed -i -E "s|https://[a-z0-9-]+\.trycloudflare\.com|$API_URL|g" netlify.toml
cd package
npx netlify env:unset API_BACKEND_URL --context production 2>/dev/null || true
npx netlify deploy --prod --message "Switch to permanent Render API"

echo ""
echo "Done!"
echo "  Frontend: https://starpolice-panel.netlify.app"
echo "  API:      $API_URL"
