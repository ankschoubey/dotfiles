#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Chrome
# @raycast.mode silent
# @raycast.icon 💻
# @raycast.packageName Chrome

if ! ps aux | grep -qi "[G]oogle Chrome"; then
    open -a "/Applications/Google Chrome.app"
    exit 0
fi

open -n -a "/Applications/Google Chrome.app"
