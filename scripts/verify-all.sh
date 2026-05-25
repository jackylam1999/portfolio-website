#!/usr/bin/env bash
# Run all automated checks — use before claiming any task done.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3055}"

echo "→ Portfolio verify:all (port $PORT)"
echo ""

fail=0

run() {
  echo "── $1"
  if bash -c "$2"; then
    echo "   ✓ OK"
  else
    echo "   ✗ FAIL"
    fail=1
  fi
  echo ""
}

# 1. Typecheck + production build
run "build (NEXT_DIST_DIR=.next-dev)" \
  "NEXT_DIST_DIR=.next-dev npm run build"

# 2. Route smoke tests (requires server on PORT)
if curl -s -o /dev/null --max-time 3 "http://127.0.0.1:${PORT}/" 2>/dev/null; then
  run "test:routes" "PORT=$PORT npm run test:routes"
  run "test:scroll" "npm run test:scroll"
  run "test:page-length" "PORT=$PORT npm run test:page-length"
  run "test:cv" "PORT=$PORT npm run test:cv"
else
  echo "── live server checks (skipped — nothing on port $PORT)"
  echo "   Start with: npm run go"
  echo ""
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "✓ verify:all passed"
  exit 0
else
  echo "✗ verify:all failed — fix before telling user done"
  exit 1
fi
