#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Close Workspace Windows
# @raycast.mode silent
# @raycast.icon 🗑️
# @raycast.packageName Aerospace

current_ws=$(aerospace list-workspaces --focused)
aerospace list-windows --workspace "$current_ws" --json | python3 -c "
import json, subprocess, sys

windows = json.load(sys.stdin)
for w in windows:
    wid = w['window-id']
    subprocess.run(['aerospace', 'focus', '--window-id', str(wid)], capture_output=True)
    subprocess.run(['aerospace', 'close'], capture_output=True)
"
