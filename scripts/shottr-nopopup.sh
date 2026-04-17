#!/bin/bash
osascript -e '
tell application "Shottr" to activate
delay 0.05
tell application "System Events"
    tell process "Shottr"
        if exists (window 1) then
            keystroke "w" using command down
        end if
    end tell
end tell
'