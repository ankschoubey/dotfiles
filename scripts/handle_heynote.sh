if ! pgrep -x "Heynote" >/dev/null; then
    open -a /Applications/Heynote.app
    exit 0
fi

FRONT_APP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')
if [ "$FRONT_APP" = "Heynote" ]; then
    osascript -e 'quit app "Heynote"'
    exit 0
fi

CURRENT_WS=$(aerospace list-workspaces --focused)
WID=$(aerospace list-windows --monitor all --app-id com.heynote.app --format '%{window-id}' | head -1)
if [ -n "$WID" ]; then
    aerospace move-node-to-workspace --window-id "$WID" "$CURRENT_WS"
fi
osascript -e 'tell app "Heynote" to activate'
