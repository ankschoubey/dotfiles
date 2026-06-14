SCRIPT_DIR="$(dirname "$0")"

if [ "$(defaults read com.apple.controlcenter AutoHideMenuBarOption)" != "0" ]; then
  "$SCRIPT_DIR/toggle-menubar.sh" true
fi

brew services stop sketchybar
brew services stop borders
pkill Breaktimer
osascript -e 'quit app "Aerospace"'
MAX_RETRIES=3
RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  open -a Aerospace
  if [ $? -eq 0 ]; then
    SUCCESS=true
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT+1))
  sleep 1
done

if [ "$SUCCESS" = false ]; then
  echo "Failed to start Aerospace after $MAX_RETRIES attempts."
  exit 1
fi
