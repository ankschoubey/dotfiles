#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Improve Prompts
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 💡

# Get the prompt from the clipboard
PROMPT=$(pbpaste)

# Instructions for the AI model
IMPROVEMENT_INSTRUCTIONS="Improve the following prompt by making it more specific, adding relevant context, and clearly defining the desired output format. Consider the persona for whom the prompt is intended and the goal of the prompt."

# Check if claude is installed
if command -v claude &> /dev/null
then
    # Call claude if installed
    claude --model sonnet "$IMPROVEMENT_INSTRUCTIONS\n\nPrompt to improve: $PROMPT" | pbcopy
    MESSAGE="Prompt improved using Claude Sonnet and copied to clipboard!"
else
    # Call gemini if claude is not installed
    gemini --model flash "$IMPROVEMENT_INSTRUCTIONS\n\nPrompt to improve: $PROMPT" | pbcopy
    MESSAGE="Prompt improved using Gemini Flash and copied to clipboard!"
fi

echo "$MESSAGE"

# Notify using terminal-notifier if installed
if command -v terminal-notifier &> /dev/null
then
    terminal-notifier -title "Prompt Improvement" -message "$MESSAGE"
fi
