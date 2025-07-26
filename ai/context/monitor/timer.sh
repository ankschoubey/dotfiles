#!/bin/bash

# This script simulates a timer monitor.
# It expects one argument: the duration in seconds.

DURATION=${1:-0}
TASK_ID=${2:-"unknown"}
MONITOR_LOG_FILE="/Users/ankushchoubey/Documents/Github/dotfiles-1/ai/context/monitor_logs/task_${TASK_ID}_timer.log"

# Ensure the log directory exists
mkdir -p "$(dirname "$MONITOR_LOG_FILE")"

# Function to output structured JSON
output_json() {
  local status="$1"
  local message="$2"
  local estimated_time="${3:-}"
  local progress="${4:-}"

  JSON_OUTPUT="{\"status\": \"$status\", \"message\": \"$message\""
  if [ -n "$estimated_time" ]; then
    JSON_OUTPUT+=", \"estimated_time\": \"$estimated_time\""
  fi
  if [ -n "$progress" ]; then
    JSON_OUTPUT+=", \"progress\": \"$progress\""
  fi
  JSON_OUTPUT+="}"
  echo "$JSON_OUTPUT" | tee -a "$MONITOR_LOG_FILE"
}

if [ "$DURATION" -le 0 ]; then
  output_json "needsInputs" "Please provide a duration in seconds."
  exit 1
fi

output_json "starting" "Timer started for $DURATION seconds."

START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))

while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  REMAINING=$((END_TIME - CURRENT_TIME))

  if [ "$REMAINING" -le 0 ]; then
    output_json "completed" "Timer finished."
    break
  fi

  PROGRESS=$((ELAPSED * 100 / DURATION))
  output_json "running" "Time remaining: $REMAINING seconds" "$REMAINING" "$PROGRESS"
  sleep 1
done
