#!/usr/bin/env bash
set -euo pipefail

USE_EMBEDDED_MONGO=false
if [[ -z "${MONGODB_URI:-}" ]] || [[ "$MONGODB_URI" == *"127.0.0.1"* ]] || [[ "$MONGODB_URI" == *"localhost"* ]]; then
  USE_EMBEDDED_MONGO=true
fi

if [ "$USE_EMBEDDED_MONGO" = true ]; then
  echo "WARNING: Using embedded MongoDB. Data is lost when the container restarts."
  echo "Set MONGODB_URI to a MongoDB Atlas connection string for permanent storage."
  mkdir -p /data/db
  mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /data/db/mongod.log
  export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/starpolice_academy}"
else
  echo "Using external MongoDB for persistent storage."
fi

if [[ "${SEED_ON_START:-}" == "true" ]]; then
  echo "Running database seed (SEED_ON_START=true)..."
  node src/seed.js || echo "WARNING: seed failed; continuing startup."
fi

exec node src/index.js
