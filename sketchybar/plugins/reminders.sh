#!/bin/bash

reminders_output=$(reminders show-all --include-overdue --due-date today 2>/dev/null)

if [ -z "$reminders_output" ]; then
  first="No overdue reminders"
else
  # reminders_output is like "0: reminder1 (time)\n1: reminder2 (time)"
  first=$(echo "$reminders_output" | head -1 | sed 's/^[0-9]*: //' | sed 's/ (.*)//')
fi

sketchybar --set reminders label="$first"
sketchybar --set reminders click_script="sketchybar --set reminders drawing=toggle"