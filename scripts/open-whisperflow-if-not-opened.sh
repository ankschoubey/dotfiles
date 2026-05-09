#!/bin/bash
if pgrep -x "Wispr Flow" >/dev/null; then
    # Check if Wispr Flow is the frontmost application
    FRONTMOST_APP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')
    if [ "$FRONTMOST_APP" = "Wispr Flow" ]; then
        osascript -e 'tell application "System Events" to set visible of process "Wispr Flow" to false'
    else
        osascript -e 'tell application "System Events" to set visible of process "Wispr Flow" to true'
        osascript -e 'tell application "Wispr Flow" to activate'
    fi
else
    open -a "/Applications/Wispr Flow.app"
fi
