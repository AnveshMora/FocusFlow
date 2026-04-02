#!/usr/bin/env bash
set -e

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Done."
}
trap cleanup EXIT INT TERM

DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:---dev}"

echo "🚀 Starting FocusFlow ($MODE)..."

# Backend
echo "  → Backend (port 3001)..."
cd "$DIR/backend" && npm run dev &
BACKEND_PID=$!

# Frontend
if [ "$MODE" = "--prod" ]; then
  echo "  → Building frontend for production..."
  cd "$DIR/frontend" && npm run build
  echo "  → Serving production build (port 3000)..."
  cd "$DIR/frontend" && npx vite preview --host &
  FRONTEND_PID=$!
else
  echo "  → Frontend dev server (port 3000)..."
  cd "$DIR/frontend" && npm run dev &
  FRONTEND_PID=$!
fi

echo ""
echo "✅ FocusFlow running ($MODE):"
echo "   Frontend → http://localhost:3000"
echo "   Backend  → http://localhost:3001"
if [ "$MODE" = "--prod" ]; then
  echo ""
  echo "   PWA + offline ready. Safe to expose via ngrok."
fi
echo ""
echo "Press Ctrl+C to stop both."

wait
