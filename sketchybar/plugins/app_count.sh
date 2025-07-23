#!/bin/bash

# Get the number of open apps
open_apps=$(osascript -e 'tell application "System Events" to count (every process whose background only is false)')

# Determine the dot color based on the number of open apps
if [ "$open_apps" -gt 7 ]; then
  color="0xFFFF0000" # Red
elif [ "$open_apps" -gt 3 ]; then
  color="0xFF00FF00" # Green
elif [ "$open_apps" -gt 1 ]; then
  color="0xFF0000FF" # Blue
else
  color="0x00000000" # Transparent
fi

# Update the SketchyBar item
sketchybar --set app_count icon="●" icon.color="$color"
