#!/bin/bash

reminders_output=$(osascript -e 'tell application "Reminders" to get name of reminders whose completed is false and due date < (current date)' 2>/dev/null)

if [ -z "$reminders_output" ] || [ "$reminders_output" = "missing value" ]; then
  first="No overdue reminders"
else
  # reminders_output is like "reminder1, reminder2"
  first=$(echo "$reminders_output" | sed 's/, /\n/g' | head -1)
fi

sketchybar --set reminders label="$first"
sketchybar --set reminders click_script="sketchybar --set reminders drawing=toggle"