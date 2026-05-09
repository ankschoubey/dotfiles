#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Quit All Apps in Workspace
# @raycast.mode silent
# @raycast.icon /Users/ankushchoubey/Documents/Github/dotfiles-1/raycast/scripts/icons/close.svg
# @raycast.packageName Aerospace

current_ws=$(aerospace list-workspaces --focused)
aerospace list-windows --workspace "$current_ws" --json | python3 -c "
import json, subprocess, sys

windows = json.load(sys.stdin)
for w in windows:
    wid = w['window-id']
    app = w['app-name']
    subprocess.run(['aerospace', 'focus', '--window-id', str(wid)], capture_output=True)

    script = '''
tell application \"System Events\"
    set frontApp to first application process whose frontmost is true
    set windowCount to count of windows of frontApp
end tell
return windowCount
'''
    result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
    window_count = int(result.stdout.strip())

    if window_count == 1:
        subprocess.run(['osascript', '-e', f'tell application \"{app}\" to quit'])
    else:
        subprocess.run(['aerospace', 'close'], capture_output=True)
"
