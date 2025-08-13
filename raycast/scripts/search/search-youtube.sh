#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Search YouTube
# @raycast.mode compact
# @raycast.icon 📹
# @raycast.packageName search
# @raycast.argument1 { "type": "text", "placeholder": "Search query" }
# @raycast.argument2 { "type": "dropdown", "placeholder": "Search type", "data": ["All", "Video", "Channel", "Playlist", "Movie", "Show"], "optional": true }

sp=""
if [ "$2" == "Video" ]; then
  sp="EgIQAQ%253D%253D"
elif [ "$2" == "Channel" ]; then
  sp="EgIQAg%253D%253D"
elif [ "$2" == "Playlist" ]; then
  sp="EgIQAw%253D%253D"
elif [ "$2" == "Movie" ]; then
  sp="EgIQBA%253D%253D"
elif [ "$2" == "Show" ]; then
  sp="EgIQBQ%253D%253D"
fi

open "https://www.youtube.com/results?search_query=${1// /+}&sp=${sp}"