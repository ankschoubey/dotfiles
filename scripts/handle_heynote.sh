#!/bin/bash

if ! pgrep -x "Heynote" >/dev/null; then
    open -a /Applications/Heynote.app
    exit 0
fi

CURRENT_WS=$(aerospace list-workspaces --focused)
HEYNOTE_WS=$(aerospace list-windows --monitor all --app-id com.heynote.app --format '%{workspace}' | head -1)

if [ "$HEYNOTE_WS" = "$CURRENT_WS" ]; then
    osascript -e 'quit app "Heynote"'
    exit 0
fi

WID=$(aerospace list-windows --monitor all --app-id com.heynote.app --format '%{window-id}' | head -1)
aerospace move-node-to-workspace --window-id "$WID" "$CURRENT_WS"
osascript -e 'tell app "Heynote" to activate'
