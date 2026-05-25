#!/bin/bash
# Production preview — one slow build, then fast page loads.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3041}"

echo "→ Stopping anything on ports 3000–3060..."
for port in $(seq 3000 3060); do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
done
sleep 1

rm -rf "$HOME/.next" 2>/dev/null || true

echo "→ Building (this may take several minutes, but only once)..."
export NEXT_TELEMETRY_DISABLED=1
./node_modules/.bin/next build

echo "→ Starting production server on http://127.0.0.1:$PORT"
exec ./node_modules/.bin/next start -p "$PORT" -H 127.0.0.1
