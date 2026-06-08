#!/bin/sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$ROOT/.git/hooks"

mkdir -p "$HOOKS_DIR"
install -m 755 "$ROOT/.githooks/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$ROOT/scripts/fix-chinese-punctuation.py"
chmod +x "$ROOT/scripts/remove-duplicate-h1.py"

echo "Installed pre-commit hook to $HOOKS_DIR/pre-commit"
