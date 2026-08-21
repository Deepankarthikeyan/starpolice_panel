#!/usr/bin/env bash
# Local + Render: use MongoDB Atlas when MONGODB_URI points at it.
# Otherwise start embedded mongod so the API can boot without a dashboard secret.
set -euo pipefail

is_render() {
  [ -n "${RENDER:-}" ] || [ -n "${RENDER_SERVICE_ID:-}" ]
}

is_local_mongo_uri() {
  [[ -z "${MONGODB_URI:-}" ]] || [[ "$MONGODB_URI" == *"127.0.0.1"* ]] || [[ "$MONGODB_URI" == *"localhost"* ]]
}

start_embedded_mongo() {
  if is_render; then
    echo "MONGODB_URI is not set to Atlas. Starting embedded MongoDB so the API can serve requests."
    echo "Data on Render free tier is ephemeral (lost on sleep/redeploy). Set Atlas in Render → Environment for permanent storage."
  else
    echo "WARNING: Using embedded MongoDB for local development."
  fi

  DB_PATH="${MONGODB_DATA_PATH:-/data/db}"
  if ! mkdir -p "$DB_PATH" 2>/dev/null; then
    DB_PATH="${HOME}/.mongodb/data"
    mkdir -p "$DB_PATH"
  fi
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

if is_local_mongo_uri; then
  start_embedded_mongo
elif is_render; then
  echo "Star Police API starting on Render using MongoDB Atlas from MONGODB_URI."
else
  echo "Using external MongoDB from MONGODB_URI."
fi

if [[ "${SEED_ON_START:-}" == "true" ]]; then
  echo "Running database seed (SEED_ON_START=true)..."
  node src/seed.js || echo "WARNING: seed failed; continuing startup."
fi

exec node src/index.js
