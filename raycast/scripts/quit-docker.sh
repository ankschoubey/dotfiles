#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Quit All Docker
# @raycast.mode silent
# @raycast.icon /Users/ankushchoubey/Documents/Github/dotfiles-1/raycast/scripts/icons/close.svg
# @raycast.packageName Docker

colima stop 2>/dev/null
osascript -e 'tell application "Docker" to quit' 2>/dev/null
