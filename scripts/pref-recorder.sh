#!/bin/bash

TMP_DIR="/tmp/pref-rec"
mkdir -p "$TMP_DIR"

BEFORE="$TMP_DIR/before"
AFTER="$TMP_DIR/after"

echo "🎙️ Recording… press ENTER when you're done changing settings."
find ~/Library/Preferences -type f -name "*.plist" \
  ! -name "com.apple.*d.plist" \
  ! -name "com.apple.tcc*" \
  ! -name "com.apple.security*" \
  -exec shasum {} \; > "$BEFORE"

read -r

echo "🛑 Stopped. Analyzing changes…"
find ~/Library/Preferences -type f -name "*.plist" \
  ! -name "com.apple.*d.plist" \
  ! -name "com.apple.tcc*" \
  ! -name "com.apple.security*" \
  -exec shasum {} \; > "$AFTER"

CHANGED=$(comm -13 <(sort "$BEFORE") <(sort "$AFTER") | awk '{print $2}')

if [ -z "$CHANGED" ]; then
  echo "No readable plist files changed."
  exit 0
fi

echo
echo "📄 Changed plist files:"
echo "$CHANGED" | while read -r file; do
  echo " • $file"
done

echo
echo "🔍 Key-level diffs:"
echo

for file in $CHANGED; do
  NAME=$(basename "$file")

  # Skip unreadable files
  if ! plutil -convert json "$file" -o "$TMP_DIR/${NAME}.after.json" 2>/dev/null; then
    echo "Skipping $NAME (unreadable)"
    continue
  fi

  cp "$file" "$TMP_DIR/$NAME.before.plist" 2>/dev/null

  if ! plutil -convert json "$TMP_DIR/$NAME.before.plist" -o "$TMP_DIR/${NAME}.before.json" 2>/dev/null; then
    echo "Skipping $NAME (cannot convert before.json)"
    continue
  fi

  echo "→ $NAME"
  diff -u "$TMP_DIR/${NAME}.before.json" "$TMP_DIR/${NAME}.after.json" || true
  echo
done
