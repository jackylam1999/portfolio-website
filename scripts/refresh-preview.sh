#!/bin/bash
# Kill stale preview servers, then start a fresh dev server.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3055}"

echo "→ Cleaning stray Next cache in home folder (if any)..."
rm -rf "$HOME/.next" 2>/dev/null || true

echo "→ Stopping anything on ports 3000–3100..."
for port in $(seq 3000 3100); do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
    echo "  killed port $port (pid $pids)"
  fi
done
sleep 1

echo "→ Clearing webpack cache (prevents pack restore warnings)..."
rm -rf .next/cache/webpack 2>/dev/null || true

if [ "${CLEAN:-0}" = "1" ]; then
  echo "→ Clearing .next (CLEAN=1)..."
  rm -rf .next
fi

echo "→ Starting dev server on http://127.0.0.1:$PORT (isolated build: .next-dev)"
echo ""
echo "  Editor mode: http://127.0.0.1:$PORT/projects/parliament-sports-complex?edit=1"
echo ""
echo "  First compile is slow on this machine (~3 min is normal)."
echo "  When you see 'Compiling / ...' — open http://127.0.0.1:$PORT and wait."
echo "  Do NOT restart unless it errors. Look for: ✓ Compiled / in ..."
echo ""

export NEXT_TELEMETRY_DISABLED=1
export NEXT_DIST_DIR=".next-dev"
export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true
ulimit -n 65536 2>/dev/null || true

if [ "${CLEAN:-0}" = "1" ]; then
  echo "→ Clearing isolated dev build (CLEAN=1)..."
  rm -rf "$NEXT_DIST_DIR" 2>/dev/null || true
fi

./node_modules/.bin/next dev -p "$PORT" -H 127.0.0.1 &
DEV_PID=$!

echo "→ Waiting for dev server..."
for _ in $(seq 1 120); do
  if /usr/bin/curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" 2>/dev/null; then
    echo "→ Server ready — pre-compiling routes in background..."
    PORT="$PORT" bash "$ROOT/scripts/warm-routes.sh" &
    break
  fi
  sleep 3
done

wait "$DEV_PID"
