#!/bin/bash

PEACH=0xfffab387
TEXT=0xffcdd6f4
SURFACE2=0xff585b70

tmux_sessions=$(tmux list-sessions 2>/dev/null | grep -c .)
if [ "$tmux_sessions" -gt 0 ]; then
  sketchybar --set $NAME drawing=on label="$tmux_sessions"
else
  sketchybar --set $NAME drawing=off
fi

if [ "$SENDER" = "clicked" ]; then
  sketchybar --set tmux_sessions popup.drawing=toggle
  
  sketchybar --remove "popup.tmux_sessions.*" 2>/dev/null
  
  tmux list-sessions -F '#{session_name}' 2>/dev/null | while IFS= read -r session; do
    [ -z "$session" ] && continue
    windows=$(tmux list-windows -t "$session" -F '#{window_index}: #{window_name}' 2>/dev/null | tr '\n' ' ')
    sketchybar --add item "popup.tmux_sessions.$session" popup.tmux_sessions \
      --set "popup.tmux_sessions.$session" \
        icon="▢" \
        icon.color=$PEACH \
        label="$session ($windows)" \
        label.color=$TEXT \
        background.color=$SURFACE2 \
        background.corner_radius=4 \
        background.drawing=on \
        background.padding_left=5 \
        background.padding_right=5
  done
  
  sketchybar --update
fi
