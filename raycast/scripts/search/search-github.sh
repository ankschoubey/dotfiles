#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Search GitHub
# @raycast.mode compact
# @raycast.icon 🐙
# @raycast.packageName search
# @raycast.argument1 { "type": "text", "placeholder": "Search query" }
# @raycast.argument2 { "type": "dropdown", "placeholder": "Search type", "data": ["Repositories", "Code", "Users", "Issues", "Pull Requests", "Commits", "Wikis"], "optional": true }

if [ -z "$2" ]
then
  type="repositories"
else
  type=$(echo "$2" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
fi

open "https://github.com/search?q=${1// /+}&type=${type}"
