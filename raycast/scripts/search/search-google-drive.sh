#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Search Google Drive
# @raycast.mode compact
#
# Optional parameters:
# @raycast.icon 🚗
# @raycast.packageName search
# @raycast.argument1 { "type": "text", "placeholder": "Search query" }

open "https://drive.google.com/drive/search?q=${1// /+}"
