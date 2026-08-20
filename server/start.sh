#!/usr/bin/env bash
# Deploys via Render deploy hook on pushes to master (server/**).
set -euo pipefail

USE_EMBEDDED_MONGO=false
if [[ -z "${MONGODB_URI:-}" ]] || [[ "$MONGODB_URI" == *"127.0.0.1"* ]] || [[ "$MONGODB_URI" == *"localhost"* ]]; then
  USE_EMBEDDED_MONGO=true
fi

if [ "$USE_EMBEDDED_MONGO" = true ]; then
  echo "WARNING: Using embedded MongoDB. Data is lost when the container restarts."
  echo "Set MONGODB_URI to a MongoDB Atlas connection string for permanent storage."
  DB_PATH="${MONGODB_DATA_PATH:-/data/db}"
  mkdir -p "$DB_PATH"
  if ! pgrep -x mongod >/dev/null 2>&1; then
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
else
  echo "Using external MongoDB for persistent storage."
fi

if [[ "${SEED_ON_START:-}" == "true" ]]; then
  echo "Running database seed (SEED_ON_START=true)..."
  node src/seed.js || echo "WARNING: seed failed; continuing startup."
fi

exec node src/index.js
