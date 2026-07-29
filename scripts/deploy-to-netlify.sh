#!/usr/bin/env bash
# Deploy to https://starpolice-panel.netlify.app
# Requires: NETLIFY_AUTH_TOKEN (from https://app.netlify.com/user/applications)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_NAME="starpolice-panel"
API_URL="${VITE_API_URL:-https://starpolice-api.onrender.com}"

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "ERROR: Set NETLIFY_AUTH_TOKEN first."
  echo "Get it from: https://app.netlify.com/user/applications#personal-access-tokens"
  exit 1
fi

echo "Building frontend (API proxied via netlify.toml; VITE_API_URL=${API_URL})"
cd "$ROOT/package"
npm ci
VITE_API_URL="$API_URL" npm run build

echo "Deploying to Netlify site: $SITE_NAME"
npx netlify-cli@17 deploy \
  --prod \
  --dir dist \
  --site "$SITE_NAME" \
  --auth "$NETLIFY_AUTH_TOKEN" \
  --message "Deploy starpolice-panel"

echo ""
echo "Live at: https://${SITE_NAME}.netlify.app"
