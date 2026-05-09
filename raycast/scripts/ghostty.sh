#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Ghostty
# @raycast.mode silent
# @raycast.icon 💻
# @raycast.packageName Ghostty

if ! ps aux | grep -qi "[g]hostty"; then
    open -a /Applications/Ghostty.app
    exit 0
fi

osascript -e 'tell app "Ghostty" to activate' -e 'tell app "System Events" to keystroke "n" using command down'
