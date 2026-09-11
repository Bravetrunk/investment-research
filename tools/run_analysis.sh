#!/usr/bin/env bash
# Runs the full institutional research pipeline for a given ticker
set -e

if [ -z "$1" ]; then
  echo "Usage: ./run_analysis.sh <TICKER>"
  exit 1
fi

TICKER=$(echo "$1" | tr '[:lower:]' '[:upper:]')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -d "$REPO_ROOT/pipeline" ]; then
  SKILL_DIR="$REPO_ROOT"
else
  SKILL_DIR="$HOME/.gemini/config/skills/investment-research"
fi
TARGET_DIR="$HOME/Desktop/$TICKER"

echo "[*] Initializing Institutional Research for $TICKER at $TARGET_DIR..."
mkdir -p "$TARGET_DIR"

if [ -f "$TARGET_DIR/valuation-model.json" ]; then
  echo "[*] Step 1: Running Deterministic Financial Calculator..."
  node "$SKILL_DIR/pipeline/calculator.mjs" "$TARGET_DIR/valuation-model.json" --write
  node "$SKILL_DIR/pipeline/calculator.mjs" "$TARGET_DIR/valuation-model.json" --verify
else
  echo "[-] $TARGET_DIR/valuation-model.json not found. Creating via exporter."
fi

echo "[*] Step 2: Compiling Institutional Financial Model & Word Memo..."
python3 "$SKILL_DIR/pipeline/exporter.py" "$TARGET_DIR"

echo "[✓] Research Complete for $TICKER:"
echo "    - Memo Document: $TARGET_DIR/RESEARCH.docx"
echo "    - Quant Model:   $TARGET_DIR/QUANT_ANALYSIS.xlsx"
echo "    - Executive MD:  $TARGET_DIR/RESEARCH.md"
