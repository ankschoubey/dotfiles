#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Search Slack
# @raycast.mode compact
#
# Optional parameters:
# @raycast.icon 💬
# @raycast.packageName search
# @raycast.argument1 { "type": "text", "placeholder": "Search query" }

open "slack://search?query=${1// /+}"
