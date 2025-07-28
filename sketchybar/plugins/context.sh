#!/bin/bash

# Get the name of the current workspace
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOTFILES_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
WORKSPACE_NAME=$($DOTFILES_ROOT/ai/context/context get)

# Get the focused monitor ID
FOCUSED_MONITOR_ID=$(aerospace list-monitors --focused | awk '{print $1}')

# Define the main monitor ID (assuming Built-in Retina Display is 1)
MAIN_MONITOR_ID="1"

if [ "$FOCUSED_MONITOR_ID" = "$MAIN_MONITOR_ID" ]; then
  # Main monitor is focused, show context_main, hide context_secondary
  sketchybar --set context_main label="$WORKSPACE_NAME" drawing=on
  sketchybar --set context_secondary drawing=off
else
  # Secondary monitor is focused, show context_secondary, hide context_main
  sketchybar --set context_secondary label="$WORKSPACE_NAME" drawing=on
  sketchybar --set context_main drawing=off
fi
