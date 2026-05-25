#!/bin/bash
# Stop every local Next.js preview/dev server for this project.
set -euo pipefail

echo "→ Stopping Next.js on ports 3000–3100..."
for port in $(seq 3000 3100); do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
    echo "  stopped port $port (pid $pids)"
  fi
done

echo "→ Stopping stray next/node processes for this repo..."
pkill -9 -f "Portfolio Website.*next" 2>/dev/null || true
sleep 2

echo "→ Second pass on ports 3000–3100..."
for port in $(seq 3000 3100); do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
    echo "  stopped port $port (pid $pids)"
  fi
done

echo "→ Done. Run: npm run go  (recommended) or npm run dev"
