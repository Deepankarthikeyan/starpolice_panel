#!/usr/bin/env bash
# Local dev: optional embedded MongoDB. Render production: MongoDB Atlas via MONGODB_URI only.
set -euo pipefail

is_render() {
  [ -n "${RENDER:-}" ] || [ -n "${RENDER_SERVICE_ID:-}" ]
}

start_embedded_mongo() {
  echo "WARNING: Using embedded MongoDB for local development only."
  echo "Production on Render requires MongoDB Atlas (see HOSTING.md)."
  DB_PATH="${MONGODB_DATA_PATH:-/data/db}"
  mkdir -p "$DB_PATH"
  if ! pgrep -x mongod >/dev/null 2>&1; then
    if ! command -v mongod >/dev/null 2>&1; then
      echo "ERROR: mongod not installed. Install MongoDB locally or set MONGODB_URI to Atlas."
      exit 1
    fi
    mongod --dbpath "$DB_PATH" --bind_ip 127.0.0.1 --port 27017 --fork --logpath "$DB_PATH/mongod.log" \
      || echo "WARNING: mongod failed to start; API will retry database connection."
  fi
  for _ in $(seq 1 30); do
    if mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
      echo "Embedded MongoDB is ready."
      break
    fi
    sleep 1
  done
  export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/starpolice_academy}"
}

if is_render; then
  echo "Star Police API starting on Render (production mode)."
  if [[ -z "${MONGODB_URI:-}" ]] || [[ "$MONGODB_URI" == *"127.0.0.1"* ]] || [[ "$MONGODB_URI" == *"localhost"* ]]; then
    echo "ERROR: Set MONGODB_URI to your MongoDB Atlas connection string in Render → Environment."
    echo "See HOSTING.md → Permanent production setup."
  else
    echo "Using MongoDB Atlas from MONGODB_URI."
  fi
else
  USE_EMBEDDED_MONGO=false
  if [[ -z "${MONGODB_URI:-}" ]] || [[ "$MONGODB_URI" == *"127.0.0.1"* ]] || [[ "$MONGODB_URI" == *"localhost"* ]]; then
    USE_EMBEDDED_MONGO=true
  fi
  if [ "$USE_EMBEDDED_MONGO" = true ]; then
    start_embedded_mongo
  else
    echo "Using external MongoDB from MONGODB_URI."
  fi
fi

if [[ "${SEED_ON_START:-}" == "true" ]]; then
  echo "Running database seed (SEED_ON_START=true)..."
  node src/seed.js || echo "WARNING: seed failed; continuing startup."
fi

exec node src/index.js
