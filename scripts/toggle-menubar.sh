#!/bin/bash

MODE="$1"

if [ "$MODE" = "true" ]; then
  VALUE="Always"
elif [ "$MODE" = "false" ]; then
  VALUE="In Full Screen Only"
else
  echo "Usage: $0 [true|false]"
  echo "  true  = Always show menu bar"
  echo "  false = Hide menu bar in full screen"
  exit 1
fi

WAS_OPEN=$(osascript -e 'tell application "System Events" to exists (processes where name is "System Settings")')

open "x-apple.systempreferences:com.apple.ControlCenter-Settings.extension"

osascript <<EOF
tell application "System Events"
	tell process "System Settings"
		repeat 20 times
			if exists window "Menu Bar" then exit repeat
			delay 0.5
		end repeat

		tell pop up button "Automatically hide and show the menu bar" of group 1 of scroll area 1 of group 1 of group 3 of splitter group 1 of group 1 of window "Menu Bar"
			click
		end tell

		delay 1

		click menu item "$VALUE" of menu 1 of pop up button "Automatically hide and show the menu bar" of group 1 of scroll area 1 of group 1 of group 3 of splitter group 1 of group 1 of window "Menu Bar"

		delay 0.5
	end tell
end tell
EOF

if [ "$WAS_OPEN" = "false" ]; then
  sleep 0.5
  osascript -e 'quit app "System Settings"'
fi
