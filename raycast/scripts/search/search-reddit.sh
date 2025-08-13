#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Search Reddit
# @raycast.mode compact
#
# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName search
# @raycast.argument1 { "type": "text", "placeholder": "Search query" }

open "https://www.reddit.com/search/?q=${1// /+}"
