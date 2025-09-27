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

You are a prompt engineering expert. Your task is to improve the following prompt to make it clearer, more specific, and more effective.
IMPORTANT RULES:
- Output ONLY the improved prompt, nothing else
- Make the prompt more specific and actionable
- Ensure the prompt will produce better results
Original prompt:
PROMPT_END

# Check if claude is installed
if command -v claude &>/dev/null; then
  # Call claude if installed
  claude --model sonnet "$IMPROVEMENT_INSTRUCTIONS\n\nPrompt to improve: $PROMPT" | pbcopy
  MESSAGE="Prompt improved using Claude Sonnet and copied to clipboard!"
else
  # Call gemini if claude is not installed
  gemini -m gemini-2.5-flash -p "$IMPROVEMENT_INSTRUCTIONS\n\nPrompt to improve: $PROMPT" | pbcopy
  MESSAGE="Prompt improved using Gemini Flash and copied to clipboard!"
fi

echo "$MESSAGE"

# Notify using terminal-notifier if installed
if command -v terminal-notifier &>/dev/null; then
  terminal-notifier -title "Prompt Improvement" -message "$MESSAGE"
fi
