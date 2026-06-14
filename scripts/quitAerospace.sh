#!/bin/bash
osascript -e 'quit app "Aerospace"'
brew services stop sketchybar
brew services stop borders

"$(dirname "$0")/toggle-menubar.sh" false

