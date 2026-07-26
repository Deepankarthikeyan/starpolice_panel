#!/usr/bin/env bash
# Deploy to https://starpolice-panel.netlify.app
# Requires: NETLIFY_AUTH_TOKEN (from https://app.netlify.com/user/applications)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_NAME="starpolice-panel"
API_URL="${VITE_API_URL:-}"

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "ERROR: Set NETLIFY_AUTH_TOKEN first."
  echo "Get it from: https://app.netlify.com/user/applications#personal-access-tokens"
  exit 1
fi

if [ -z "$API_URL" ]; then
  if [ -f /tmp/api-tunnel.log ]; then
    API_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/api-tunnel.log | head -1)
  fi
fi

if [ -z "$API_URL" ]; then
  echo "ERROR: Set VITE_API_URL to your API URL (e.g. Render API)"
  exit 1
fi

echo "Building frontend with API: $API_URL"
cd "$ROOT/package"
npm ci
VITE_API_URL="$API_URL" npm run build

echo "Deploying to Netlify site: $SITE_NAME"
cd dist
npx netlify deploy --prod --dir . --auth "$NETLIFY_AUTH_TOKEN" --site "$SITE_NAME" 2>/dev/null \
  || npx netlify deploy --prod --dir . --auth "$NETLIFY_AUTH_TOKEN" --message "Deploy starpolice-panel"

echo ""
echo "Live at: https://${SITE_NAME}.netlify.app"
