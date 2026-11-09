#!/bin/bash

export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/local/bin:$PATH"

osascript -e 'quit app "Aerospace"'
brew services stop sketchybar
brew services stop borders

"$(dirname "$0")/toggle-menubar.sh" false
