#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

get_timer_display() {
    "$SCRIPT_DIR/timer.sh" display "$1"
}

get_timer_state() {
    "$SCRIPT_DIR/timer.sh" state "$1"
}

if [ "$SENDER" = "aerospace_workspace_change" ]; then
  prevapps=$(aerospace list-windows --workspace "$PREV_WORKSPACE" | awk -F'|' '{gsub(/^ *| *$/, "", $2); print $2}')
  if [ "${prevapps}" != "" ]; then
    sketchybar --set space.$PREV_WORKSPACE drawing=on
    icon_strip=""
    while read -r app
    do
      icon_strip+=" $($CONFIG_DIR/plugins/icon_map_fn.sh "$app")"
    done <<< "${prevapps}"
    
    # Check for timer
    TIMER_STATE=$(get_timer_state "$PREV_WORKSPACE")
    if [[ "$TIMER_STATE" == "active:"* ]]; then
      FORMATTED=$(get_timer_display "$PREV_WORKSPACE")
      sketchybar --set space.$PREV_WORKSPACE label="⏱ $FORMATTED $icon_strip"
    else
      sketchybar --set space.$PREV_WORKSPACE label="$icon_strip"
    fi
  else
    sketchybar --set space.$PREV_WORKSPACE drawing=off
  fi
else
  FOCUSED_WORKSPACE="$(aerospace list-workspaces --focused)"
fi

apps=$(aerospace list-windows --workspace "$FOCUSED_WORKSPACE" | awk -F'|' '{gsub(/^ *| *$/, "", $2); print $2}')
sketchybar --set space.$FOCUSED_WORKSPACE drawing=on
icon_strip=""
if [ "${apps}" != "" ]; then
  while read -r app
  do
    icon_strip+=" $($CONFIG_DIR/plugins/icon_map_fn.sh "$app")"
  done <<< "${apps}"
else
  icon_strip=""
fi

# Check for timer
TIMER_STATE=$(get_timer_state "$FOCUSED_WORKSPACE")
if [[ "$TIMER_STATE" == "active:"* ]]; then
  FORMATTED=$(get_timer_display "$FOCUSED_WORKSPACE")
  sketchybar --set space.$FOCUSED_WORKSPACE label="⏱ $FORMATTED $icon_strip"
else
  sketchybar --set space.$FOCUSED_WORKSPACE label="$icon_strip"
fi
