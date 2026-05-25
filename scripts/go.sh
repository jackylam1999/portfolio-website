#!/bin/bash
# Reliable local preview: stop → build → production server (no file-watcher issues).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3055}"

bash "$ROOT/scripts/stop-all-servers.sh" || true
sleep 2

export NEXT_TELEMETRY_DISABLED=1
export NEXT_DIST_DIR=".next-dev"

echo "→ Building..."
./node_modules/.bin/next build

echo "→ Starting on http://127.0.0.1:$PORT"
echo "  Editor: http://127.0.0.1:$PORT/projects/parliament-sports-complex?edit=1"
./node_modules/.bin/next start -p "$PORT" -H 127.0.0.1
