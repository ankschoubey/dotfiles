#!/bin/bash

open -na Ghostty --args --working-directory=/Users/ankushchoubey/Documents/github/trello-linter -e zsh -c "sleep 1; WIN_ID=\$(aerospace list-windows --all | grep trello-linter | head -1 | awk '{print \$1}'); aerospace move-node-to-workspace 1 --window-id \$WIN_ID; npm run analytics; exec zsh"
