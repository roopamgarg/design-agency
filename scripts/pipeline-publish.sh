#!/usr/bin/env bash
set -euo pipefail

# Pipeline publish script — called by the CTO orchestrator after all pipeline
# stages complete and the design review passes.
#
# Usage:  scripts/pipeline-publish.sh <project-slug>
# Example: scripts/pipeline-publish.sh agent-messenger
#
# What it does:
#   1. Validates that expected pipeline outputs exist in designs/<slug>/
#   2. Creates the project viewer page if missing
#   3. Checks if the project is listed in the portfolio index.html
#   4. Commits any uncommitted pipeline outputs
#   5. Pushes to origin/main

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: scripts/pipeline-publish.sh <project-slug>"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGNS="$ROOT/designs/$SLUG"

echo "=== Pipeline Publish: $SLUG ==="
echo ""

# --- Step 1: Validate expected outputs ---
echo "[1/5] Validating pipeline outputs..."

ERRORS=()
[ -d "$DESIGNS/screens" ] && [ "$(ls -A "$DESIGNS/screens" 2>/dev/null)" ] \
  || ERRORS+=("Missing or empty: designs/$SLUG/screens/")

[ -d "$DESIGNS/system" ] && [ "$(ls -A "$DESIGNS/system" 2>/dev/null)" ] \
  || ERRORS+=("Missing or empty: designs/$SLUG/system/")

[ -f "$ROOT/designs/tokens.css" ] \
  || ERRORS+=("Missing: designs/tokens.css")

if [ "${#ERRORS[@]}" -gt 0 ]; then
  echo "VALIDATION FAILED:"
  for e in "${ERRORS[@]}"; do echo "  - $e"; done
  exit 1
fi

SCREEN_COUNT=$(ls "$DESIGNS/screens/"*.html 2>/dev/null | wc -l | tr -d ' ')
PROTO_COUNT=$(ls "$DESIGNS/prototypes/"*.html 2>/dev/null | wc -l | tr -d ' ')
echo "  Found $SCREEN_COUNT screens, $PROTO_COUNT prototypes"
echo ""

# --- Step 2: Create project viewer if missing ---
echo "[2/5] Checking project viewer..."
if [ ! -f "$DESIGNS/index.html" ]; then
  echo "  Project viewer missing — generating from screen inventory..."

  TITLE=$(echo "$SLUG" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

  SCREEN_ITEMS=""
  NUM=1
  for f in "$DESIGNS/screens/"*.html; do
    BASENAME=$(basename "$f" .html)
    NAME=$(echo "$BASENAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    SCREEN_ITEMS="${SCREEN_ITEMS}          { num: $NUM, file: \"screens/$BASENAME.html\", name: \"$NAME\", desc: \"\" },
"
    NUM=$((NUM + 1))
  done

  PROTO_ITEMS=""
  PNUM=1
  for f in "$DESIGNS/prototypes/"*.html; do
    [ -f "$f" ] || continue
    BASENAME=$(basename "$f" .html)
    NAME=$(echo "$BASENAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    PROTO_ITEMS="${PROTO_ITEMS}          { num: \"P$PNUM\", file: \"prototypes/$BASENAME.html\", name: \"$NAME\", desc: \"\" },
"
    PNUM=$((PNUM + 1))
  done

  COUNTER="${SCREEN_COUNT} screens"
  [ "$PROTO_COUNT" -gt 0 ] && COUNTER="$COUNTER · $PROTO_COUNT prototypes"

  cat > "$DESIGNS/index.html" <<VIEWER
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE} — UI Design Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../shared/project-viewer.css">
</head>
<body>
  <script>
    window.PROJECT_CONFIG = {
      title: "${TITLE}",
      backLink: "../../index.html",
      counterText: "${COUNTER}",
      accent: "#6366F1",
      accentLight: "rgba(99, 102, 241, 0.08)",
      accentHover: "rgba(99, 102, 241, 0.14)",
      screenshotPaths: function (htmlFile) {
        var slug = htmlFile.split("/").pop().replace(".html", "");
        var isProto = htmlFile.includes("prototypes/");
        return {
          desktop: isProto ? "prototypes/screenshots/" + slug + "-desktop.png" : "screenshots/" + slug + ".png",
          mobile:  isProto ? "prototypes/screenshots/" + slug + "-mobile.png"  : "screenshots/" + slug + ".png",
        };
      },
      screens: [
        { group: "Screens", items: [
${SCREEN_ITEMS}        ]},
VIEWER

  if [ -n "$PROTO_ITEMS" ]; then
    cat >> "$DESIGNS/index.html" <<VIEWER
        { group: "Prototypes", type: "prototype", items: [
${PROTO_ITEMS}        ]},
VIEWER
  fi

  cat >> "$DESIGNS/index.html" <<'VIEWER'
      ]
    };
  </script>
  <script src="../../shared/project-viewer.js"></script>
</body>
</html>
VIEWER

  echo "  Created designs/$SLUG/index.html"
else
  echo "  Project viewer already exists"
fi
echo ""

# --- Step 3: Check portfolio listing ---
echo "[3/5] Checking portfolio index..."
if grep -q "\"$SLUG\"" "$ROOT/index.html" 2>/dev/null; then
  echo "  Project '$SLUG' already listed in portfolio"
else
  echo "  WARNING: Project '$SLUG' is NOT in portfolio index.html"
  echo "  The CTO must manually add the project card to index.html PROJECTS array."
fi
echo ""

# --- Step 4: Commit uncommitted pipeline outputs ---
echo "[4/5] Committing pipeline outputs..."
cd "$ROOT"

git add "designs/$SLUG/" "designs/tokens.css" 2>/dev/null || true

if git diff --cached --quiet; then
  echo "  No uncommitted changes — all pipeline outputs already committed"
else
  git commit -m "feat(pipeline): publish $SLUG design deliverables

Publish pipeline outputs after design review passed.
- Screens: $SCREEN_COUNT
- Prototypes: $PROTO_COUNT

Co-Authored-By: Paperclip <noreply@paperclip.ing>"
  echo "  Committed pipeline outputs"
fi

# Also commit portfolio changes if any
git add index.html 2>/dev/null || true
if ! git diff --cached --quiet; then
  git commit -m "feat: add $SLUG to portfolio index

Co-Authored-By: Paperclip <noreply@paperclip.ing>"
  echo "  Committed portfolio update"
fi
echo ""

# --- Step 5: Push ---
echo "[5/5] Pushing to origin/main..."
git push origin main
echo ""

echo "=== Publish complete: $SLUG ==="
echo "  Screens: $SCREEN_COUNT"
echo "  Prototypes: $PROTO_COUNT"
echo "  Viewer: designs/$SLUG/index.html"
