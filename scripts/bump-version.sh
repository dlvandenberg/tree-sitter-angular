#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! "${1:-}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: $0 <X.Y.Z>"
  exit 1
fi

NEW="$1"
echo "Setting version to $NEW"

sed -i "s/\"version\": \"[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\"/\"version\": \"$NEW\"/" "$ROOT_DIR/package.json" "$ROOT_DIR/tree-sitter.json"
sed -i "s/^version = \"[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\"/version = \"$NEW\"/" "$ROOT_DIR/Cargo.toml" "$ROOT_DIR/pyproject.toml"

echo "Updated package.json, Cargo.toml, pyproject.toml, tree-sitter.json to $NEW"
