#!/bin/bash

PROJECT="/Users/ankushchoubey/Documents/Github/safari-highlighter"

/Users/ankushchoubey/Documents/Github/dotfiles-1/scripts/session-safari-highlighter.sh

open -na Ghostty --args \
    --working-directory="$PROJECT" \
    -e /Users/ankushchoubey/Documents/Github/dotfiles-1/scripts/pick-next-session.sh "$PROJECT"