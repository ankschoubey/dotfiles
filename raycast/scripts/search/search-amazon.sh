#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Search Amazon
# @raycast.mode compact
# @raycast.icon 🛒
# @raycast.packageName search
# @raycast.argument1 { "type": "text", "placeholder": "Search query" }

open "https://www.amazon.in/s?k=${1// /+}"
