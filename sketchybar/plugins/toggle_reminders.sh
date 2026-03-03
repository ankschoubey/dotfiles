#!/bin/bash

first=$(sketchybar --query reminders | jq -r '.first // "No overdue reminders"')
count=$(sketchybar --query reminders | jq -r '.count // 0')
current_mode=$(sketchybar --query reminders | jq -r '.mode // "icon"')

if [ "$current_mode" = "icon" ]; then
  if [ "$first" = "No overdue reminders" ]; then
    sketchybar --set reminders background.drawing=off
  else
    sketchybar --set reminders background.drawing=on
  fi
  sketchybar --set reminders mode="text" icon.drawing=off label="$first"
else
  sketchybar --set reminders mode="icon" icon.drawing=on label="$count" icon="" background.drawing=on
fi