#!/usr/bin/env bash

if [ "$SENDER" = "front_app_switched" ]; then
  icon="$(~/.config/sketchybar/plugins/icon_map_fn.sh "$INFO")"
  label="$INFO"

  pid=$(osascript -e 'tell application "System Events" to get unix id of first process whose frontmost is true' 2>/dev/null)
  if [ -n "$pid" ]; then
    cwd=$(lsof -p "$pid" -d cwd 2>/dev/null | awk 'NR>1 {print $NF}')
    if [ -n "$cwd" ]; then
      branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null)
      if [ -n "$branch" ]; then
        dirty=$(git -C "$cwd" status --porcelain 2>/dev/null)
        if [ -n "$dirty" ]; then
          label="$INFO   $branch ●"
        else
          label="$INFO   $branch"
        fi
      fi
    fi
  fi

  sketchybar --set "$NAME" icon="$icon" label="$label"
fi
