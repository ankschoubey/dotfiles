#!/bin/bash

# Log file in the user's home directory
LOG_FILE="$HOME/sketchybar_context_plugin.log"

echo "---" >> "$LOG_FILE"
date >> "$LOG_FILE"
echo "Script triggered for item: $NAME" >> "$LOG_FILE"

# Get the name of the current workspace
WORKSPACE_NAME=$(/Users/ankushchoubey/Documents/Github/dotfiles-1/ai/context/context get)
echo "Workspace name found: '$WORKSPACE_NAME'" >> "$LOG_FILE"

# Set the label of the Sketchybar item
sketchybar --set "$NAME" label="$WORKSPACE_NAME"
echo "Set label for $NAME to '$WORKSPACE_NAME'" >> "$LOG_FILE"