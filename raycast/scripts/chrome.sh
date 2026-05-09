#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Chrome
# @raycast.mode silent
# @raycast.icon /Users/ankushchoubey/Documents/Github/dotfiles-1/icons/chrome.sv
# @raycast.packageName Chrome
# @raycast.argument1 { "type": "dropdown", "placeholder": "Profile", "optional": true, "data": [ { "title": "Ankush", "value": "Ankush" }, { "title": "Business Ankush", "value": "Business Ankush" }, { "title": "Dev Flax", "value": "Dev Flax" } ] }
# TO REGENERATE DROPDOWN PROFILES (when Chrome profiles change):
# 1. Run: bash raycast/scripts/generate-chrome-sh.sh
# 2. Re-index Raycast

profile_dir() {
  python3 -c "
import json,sys
data = json.load(sys.stdin)
for key, val in data['profile']['info_cache'].items():
    if val['name'] == sys.argv[1]:
        print(key)
        break
" < "$HOME/Library/Application Support/Google/Chrome/Local State"
}

if ! ps aux | grep -qi "[G]oogle Chrome"; then
    open -a "/Applications/Google Chrome.app"
    sleep 1
fi

if [ -n "$1" ] && [ "$1" != "undefined" ]; then
    dir=$(profile_dir "$1")
    open -n -a "/Applications/Google Chrome.app" --args --profile-directory="$dir"
else
    open -n -a "/Applications/Google Chrome.app"
fi
