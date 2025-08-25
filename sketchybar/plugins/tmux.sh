#!/bin/bash

# Get the number of active tmux sessions, stripping spaces and empty lines
tmux_sessions=$(tmux list-sessions 2>/dev/null | grep -c .)

# Set the sketchybar item
#
sketchybar --set $NAME label="$tmux_sessions"
