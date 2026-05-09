#!/bin/bash

BLUE=0xff89b4fa
TEXT=0xffcdd6f4
SURFACE2=0xff585b70

COUNT=$(docker ps -q 2>/dev/null | grep -c .)
if [ "$COUNT" -gt 0 ]; then
  sketchybar --set $NAME drawing=on label="$COUNT"
else
  sketchybar --set $NAME drawing=off
fi

if [ "$SENDER" = "clicked" ]; then
  sketchybar --set docker_containers popup.drawing=toggle
  
  sketchybar --remove "popup.docker_containers.*" 2>/dev/null
  
  docker ps --format '{{.Names}}|{{.Image}}|{{.Status}}|{{.RunningFor}}' 2>/dev/null | while IFS= read -r line; do
    [ -z "$line" ] && continue
    name=$(echo "$line" | cut -d'|' -f1)
    image=$(echo "$line" | cut -d'|' -f2)
    status=$(echo "$line" | cut -d'|' -f3)
    running=$(echo "$line" | cut -d'|' -f4)
    sketchybar --add item "popup.docker_containers.$name" popup.docker_containers \
      --set "popup.docker_containers.$name" \
        icon="▢" \
        icon.color=$BLUE \
        label="$name | $image | $status | $running" \
        label.color=$TEXT \
        background.color=$SURFACE2 \
        background.corner_radius=4 \
        background.drawing=on \
        background.padding_left=5 \
        background.padding_right=5
  done
  
  sketchybar --update
fi
