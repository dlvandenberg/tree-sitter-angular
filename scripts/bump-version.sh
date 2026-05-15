#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

usage() {
  echo "Usage: $0 <major|minor|patch|X.Y.Z>"
  echo ""
  echo "Examples:"
  echo "  $0 patch       # 0.8.5 -> 0.8.6"
  echo "  $0 minor       # 0.8.5 -> 0.9.0"
  echo "  $0 major       # 0.8.5 -> 1.0.0"
  echo "  $0 1.2.3       # set explicit version"
  exit 1
}

[[ $# -eq 1 ]] || usage

# Read current version from package.json
CURRENT=$(grep -m1 '"version"' "$ROOT_DIR/package.json" | sed 's/.*"\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)".*/\1/')

if [[ -z "$CURRENT" ]]; then
  echo "Error: could not read current version from package.json"
  exit 1
fi

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$1" in
  major) NEW="$((MAJOR + 1)).0.0" ;;
  minor) NEW="$MAJOR.$((MINOR + 1)).0" ;;
  patch) NEW="$MAJOR.$MINOR.$((PATCH + 1))" ;;
  [0-9]*)
    if [[ ! "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "Error: version must be in X.Y.Z format"
      exit 1
    fi
    NEW="$1"
    ;;
  *) usage ;;
esac

echo "Bumping version: $CURRENT -> $NEW"

# package.json — first "version" field
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" "$ROOT_DIR/package.json"

# Cargo.toml — version under [package]
sed -i '' "s/^version = \"$CURRENT\"/version = \"$NEW\"/" "$ROOT_DIR/Cargo.toml"

# pyproject.toml — version under [project]
sed -i '' "s/^version = \"$CURRENT\"/version = \"$NEW\"/" "$ROOT_DIR/pyproject.toml"

# tree-sitter.json — "version" in metadata
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" "$ROOT_DIR/tree-sitter.json"

echo "Updated:"
echo "  package.json     -> $NEW"
echo "  Cargo.toml       -> $NEW"
echo "  pyproject.toml   -> $NEW"
echo "  tree-sitter.json -> $NEW"
