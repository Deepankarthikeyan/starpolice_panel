#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! pgrep -x mongod >/dev/null 2>&1; then
  mkdir -p /data/db
  mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/mongod.log
fi

for _ in $(seq 1 20); do
  if mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

cd "$ROOT/server"
if ! node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);
const count = await mongoose.connection.db.collection('users').countDocuments({ role: 'superadmin' });
await mongoose.disconnect();
process.exit(count > 0 ? 0 : 1);
" 2>/dev/null; then
  npm run seed
fi
