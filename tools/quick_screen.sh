#!/usr/bin/env bash
# Runs comparative screening across candidate tickers
set -e

if [ "$#" -lt 1 ]; then
  echo "Usage: ./quick_screen.sh <TICKER1> <TICKER2> ..."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -d "$REPO_ROOT/pipeline" ]; then
  SKILL_DIR="$REPO_ROOT"
else
  SKILL_DIR="$HOME/.gemini/config/skills/investment-research"
fi
TEAM_DIR="$HOME/Desktop/investment-research-team"

echo "[*] Screening tickers: $@..."
python3 "$SKILL_DIR/pipeline/exporter.py" --screen "$@"

echo "[*] Copying screen comparison to team command center..."
cp "$HOME/Desktop/SCREEN_COMPARISON.xlsx" "$TEAM_DIR/SCREEN_COMPARISON.xlsx" 2>/dev/null || true
cp "$HOME/Desktop/COMPARISON.md" "$TEAM_DIR/COMPARISON.md" 2>/dev/null || true

echo "[✓] Screen complete. Master comparison available at $TEAM_DIR/SCREEN_COMPARISON.xlsx"
