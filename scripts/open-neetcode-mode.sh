#!/bin/bash

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# `open -na Chrome <url>` drops every URL into one window as tabs. The Chrome
# binary with --new-window is what actually yields separate windows for AeroSpace
# to tile. Same pattern as raycast/chrome-profiles/src/chrome/launch.ts.
nohup "$CHROME" --new-window "https://chatgpt.com" >/dev/null 2>&1 &
sleep 1
nohup "$CHROME" --new-window "https://neetcode.io/roadmap" >/dev/null 2>&1 &
sleep 1
nohup "$CHROME" --new-window "https://trello-linter.pages.dev/notes/new?step=note-type" >/dev/null 2>&1 &

# Chrome stacks each new window on top, so the last one launched ends up front.
# Raise the ChatGPT window so typing can start immediately.
sleep 2
osascript -e 'tell application "Google Chrome" to set index of window 3 to 1' >/dev/null 2>&1
