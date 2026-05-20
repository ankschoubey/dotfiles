#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Chrome
# @raycast.mode silent
# @raycast.icon /Users/ankushchoubey/Documents/Github/dotfiles-1/raycast/scripts/icons/chrome.svg
# @raycast.packageName Chrome
# TO REGENERATE PROFILE LIST (when Chrome profiles change):
# 1. Run: bash raycast/scripts/generate-chrome-sh.sh
# 2. Update the PROFILES array below

PROFILES=(
  "Ankush"
  "Business Ankush"
  "Dev Flax"
  "Feel And Heal"
  "Prod Svaaya"
  "Your Chrome"
)

profile_dir() {
  python3 -c "
import json,sys
data = json.load(sys.stdin)
for key, val in data['profile']['info_cache'].items():
    if val['name'] == sys.argv[1]:
        print(key)
        break
" "$1" < "$HOME/Library/Application Support/Google/Chrome/Local State"
}

# Build AppleScript dynamically
script='tell application "Finder"
    activate
    set profileList to {'
i=1
for p in "${PROFILES[@]}"; do
  [ $i -gt 1 ] && script="$script, "
  script="$script\"$i. $p\""
  ((i++))
done
script="$script}
    delay 0.2
    choose from list profileList with title \"Chrome\" with prompt \"Select Profile:\" default items {\"1. ${PROFILES[0]}\"} OK button name \"Open\" Cancel button name \"Cancel\"
end tell"

selected=$(osascript -e "$script" 2>/dev/null)

[ "$selected" = "false" ] || [ -z "$selected" ] && exit 0

# Strip number prefix
profile="${selected#*. }"
profile="${profile# }"

if ! ps aux | grep -qi "[G]oogle Chrome"; then
    dir=$(profile_dir "$profile")
    open -a "/Applications/Google Chrome.app" --args --profile-directory="$dir"
else
    dir=$(profile_dir "$profile")
    open -n -a "/Applications/Google Chrome.app" --args --profile-directory="$dir"
fi
