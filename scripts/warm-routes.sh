#!/bin/bash
# Pre-compile all routes so first click navigates instantly in dev mode.
set -euo pipefail

PORT="${PORT:-3041}"
BASE="http://127.0.0.1:${PORT}"
CURL="/usr/bin/curl"

routes=(
  "/"
  "/cv"
  "/contact"
  "/projects/parliament-sports-complex"
  "/projects/shack-in-the-paddyfield"
  "/projects/16-units-above-a-city-brewery"
  "/projects/breathe-on-the-land"
  "/projects/stool-sm-1-39-03"
  "/projects/eternal-voyage"
  "/projects/symbiosis"
  "/projects/inflection-journal-vol-10"
)

echo "→ Warming routes on ${BASE}..."
for path in "${routes[@]}"; do
  printf "  %-45s " "$path"
  "$CURL" -s -o /dev/null -w "%{http_code} in %{time_total}s\n" --max-time 600 "${BASE}${path}" || echo "failed"
done
echo "→ All routes warm."
