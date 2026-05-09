#!/bin/bash

# Get the focused workspace ID
WORKSPACE_ID=$(/Applications/Aerospace.app/Contents/MacOS/aerospace list-workspaces --focused)

# Define the storage path for contexts
STORAGE_PATH="$HOME/.aerospace-context"

# Get the context name
CONTEXT_NAME=""
if [ -f "$STORAGE_PATH/$WORKSPACE_ID" ]; then
  CONTEXT_NAME=$(cat "$STORAGE_PATH/$WORKSPACE_ID")
else
  CONTEXT_NAME="(unnamed)"
fi

# Output the formatted string
echo "workspace:$WORKSPACE_ID ($CONTEXT_NAME)"
