#!/bin/bash
profiles=$(python3 -c "
import json,sys
data = json.load(sys.stdin)
profiles = sorted(data['profile']['info_cache'].items(), key=lambda x: x[1].get('name', ''))
names = [val['name'] for _, val in profiles]
print(json.dumps(names))
" < "$HOME/Library/Application Support/Google/Chrome/Local State")

cat > "$(dirname "$0")/chrome.sh" << SCRIPT
#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Chrome
# @raycast.mode compact
# @raycast.icon 💻
# @raycast.packageName Chrome
# @raycast.argument1 { "type": "dropdown", "placeholder": "Profile", "data": $profiles, "optional": true }

profile_dir() {
  python3 -c "
import json,sys
data = json.load(sys.stdin)
for key, val in data['profile']['info_cache'].items():
    if val['name'] == sys.argv[1]:
        print(key)
        break
" < "\$HOME/Library/Application Support/Google/Chrome/Local State"
}

if ! ps aux | grep -qi "[G]oogle Chrome"; then
    open -a "/Applications/Google Chrome.app"
    sleep 1
fi

if [ -n "\$1" ] && [ "\$1" != "undefined" ]; then
    dir=\$(profile_dir "\$1")
    open -n -a "/Applications/Google Chrome.app" --args --profile-directory="\$dir"
else
    open -n -a "/Applications/Google Chrome.app"
fi
SCRIPT

chmod +x "$(dirname "$0")/chrome.sh"
echo "Generated chrome.sh with profiles: $profiles"
