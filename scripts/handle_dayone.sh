#!/bin/bash
osascript -e 'tell app "Day One" to activate' \
  -e 'delay 0.15' \
  -e 'tell app "System Events" to tell process "Day One" to click menu item "New Entry In New Window" of menu "File" of menu bar 1' \
  -e 'delay 0.1' \
  -e 'tell app "System Events" to tell process "Day One" to click menu item "Move Tab To New Window" of menu "Window" of menu bar 1'
