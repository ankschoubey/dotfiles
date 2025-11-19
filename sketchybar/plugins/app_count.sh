#!/bin/bash

# Get the number of open apps
open_apps=$(osascript -e 'tell application "System Events" to count (every process whose background only is false)')

# Debug
echo "Open apps: $open_apps" > /tmp/app_count_debug.log

# Determine the dot color based on the number of open apps
if [ "$open_apps" -gt 5 ]; then
  color="0xFFFF0000" # Red
elif [ "$open_apps" -gt 2 ]; then
  color="0xFF00FF00" # Green
elif [ "$open_apps" -gt 0 ]; then
  color="0xFF0000FF" # Blue
else
  color="0xFF6C7086" # Gray for no apps
fi

# Update the SketchyBar item
sketchybar --set app_count icon="●" icon.color="$color" label="$open_apps"
