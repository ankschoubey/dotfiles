#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Improve Prompts
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖

# Get the prompt from the clipboard
PROMPT=$(pbpaste)

# Instructions for the Gemini model
IMPROVEMENT_INSTRUCTIONS="Improve the following prompt by making it more specific, adding relevant context, and clearly defining the desired output format. Consider the persona for whom the prompt is intended and the goal of the prompt."

# Send the prompt and instructions to the local Gemini CLI for improvement and copy the result to the clipboard
gemini "$IMPROVEMENT_INSTRUCTIONS

Prompt to improve: $PROMPT" | pbcopy

echo "Prompt improved and copied to clipboard!"