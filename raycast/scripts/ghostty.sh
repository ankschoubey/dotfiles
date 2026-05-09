#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Ghostty
# @raycast.mode silent
# @raycast.icon /Users/ankushchoubey/Documents/Github/dotfiles-1/raycast/scripts/icons/ghostty.svg
# @raycast.packageName Ghostty

if ! ps aux | grep -qi "[g]hostty"; then
    open -a /Applications/Ghostty.app
    exit 0
fi

open -n /Applications/Ghostty.app
