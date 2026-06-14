#!/bin/bash
aerospace reload-config 2>&1
if [ $? -eq 0 ]; then
  osascript -e 'display notification "AeroSpace config reloaded successfully" with title "AeroSpace" sound name "Glass"'
else
  osascript -e 'display notification "Check logs for errors" with title "AeroSpace Reload Failed" sound name "Basso"'
fi
