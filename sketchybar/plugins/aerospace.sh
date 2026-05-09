#!/usr/bin/env bash

# Catppuccin Mocha colors
CRUST=0xff11111b
MAUVE=0xff7b5ea7
YELLOW=0xffd9a84a
RED=0xffc05060
PEACH=0xffb0724a
MAROON=0xffa06070
TEXT=0xffcdd6f4

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="${PLUGIN_DIR:-$SCRIPT_DIR}"

get_timer_state() {
    "$SCRIPT_DIR/timer.sh" state "$1"
}

get_timer_display() {
    "$SCRIPT_DIR/timer.sh" display "$1"
}

get_app_icons() {
    local sid="$1"
    local apps
    apps=$(aerospace list-windows --workspace "$sid" 2>/dev/null | awk -F'|' '{gsub(/^ *| *$/, "", $2); print $2}')
    
    if [[ -z "$apps" ]]; then
        echo ""
        return
    fi
    
    local icon_strip=""
    while read -r app; do
        icon_strip+=" $("$PLUGIN_DIR/icon_map_fn.sh" "$app")"
    done <<< "$apps"
    echo "$icon_strip"
}

if [ "$SENDER" = "mouse.clicked" ]; then
  sketchybar --set $NAME popup.drawing=toggle
  return
fi

TIMER_STATE=$(get_timer_state "$1")
WORKSPACE_NUM="$1"
APP_ICONS=$(get_app_icons "$1")
FOCUSED_WORKSPACE="${FOCUSED_WORKSPACE:-$(aerospace list-workspaces --focused | xargs)}"

if [[ "$TIMER_STATE" == "active:"* ]]; then
    FORMATTED=$(get_timer_display "$1")
    if [[ -n "$APP_ICONS" ]]; then
        LABEL="⏱ $FORMATTED $APP_ICONS"
    else
        LABEL="⏱ $FORMATTED"
    fi
elif [[ "$TIMER_STATE" == "expired" ]] || [[ "$TIMER_STATE" == "completed" ]]; then
    FORMATTED=$(get_timer_display "$1")
    if [[ "$FORMATTED" == "alert" ]]; then
        if [[ -n "$APP_ICONS" ]]; then
            LABEL="⏰ $APP_ICONS"
        else
            LABEL="⏰"
        fi
    else
        if [[ -n "$APP_ICONS" ]]; then
            LABEL="⏱ $FORMATTED $APP_ICONS"
        else
            LABEL="⏱ $FORMATTED"
        fi
    fi
else
    if [[ -n "$APP_ICONS" ]]; then
        LABEL="$APP_ICONS"
    else
        LABEL=""
    fi
fi

if [ "$1" = "$FOCUSED_WORKSPACE" ]; then
    if [[ "$TIMER_STATE" == "active:"* ]]; then
        sketchybar --set $NAME \
            background.color=$CRUST \
            label.shadow.drawing=off \
            icon.shadow.drawing=off \
            background.border_width=2 \
            background.border_color=$PEACH \
            icon="$WORKSPACE_NUM" \
            label="$LABEL"
    elif [[ "$TIMER_STATE" == "expired" ]] || [[ "$TIMER_STATE" == "completed" ]]; then
        FORMATTED=$(get_timer_display "$1")
        if [[ "$FORMATTED" == "alert" ]]; then
            sketchybar --set $NAME \
                background.color=$CRUST \
                label.shadow.drawing=off \
                icon.shadow.drawing=off \
                background.border_width=2 \
                background.border_color=$MAROON \
                icon="$WORKSPACE_NUM" \
                label="$LABEL"
        else
            sketchybar --set $NAME \
                background.color=$CRUST \
                label.shadow.drawing=off \
                icon.shadow.drawing=off \
                background.border_width=2 \
                background.border_color=$PEACH \
                icon="$WORKSPACE_NUM" \
                label="$LABEL"
        fi
    else
        sketchybar --set $NAME \
            background.color=$CRUST \
            label.shadow.drawing=off \
            icon.shadow.drawing=off \
            background.border_width=2 \
            icon="$WORKSPACE_NUM" \
            label="$LABEL"
    fi
else
    if [[ "$TIMER_STATE" == "active:"* ]]; then
        sketchybar --set $NAME \
            background.color=0x44FFFFFF \
            label.shadow.drawing=off \
            icon.shadow.drawing=off \
            background.border_width=0 \
            icon="$WORKSPACE_NUM" \
            label="$LABEL"
    elif [[ "$TIMER_STATE" == "expired" ]] || [[ "$TIMER_STATE" == "completed" ]]; then
        FORMATTED=$(get_timer_display "$1")
        if [[ "$FORMATTED" == "alert" ]]; then
            sketchybar --set $NAME \
                background.color=$MAROON \
                label.shadow.drawing=off \
                icon.shadow.drawing=off \
                background.border_width=2 \
                icon="$WORKSPACE_NUM" \
                label="$LABEL"
        else
            sketchybar --set $NAME \
                background.color=0x44FFFFFF \
                label.shadow.drawing=off \
                icon.shadow.drawing=off \
                background.border_width=0 \
                icon="$WORKSPACE_NUM" \
                label="$LABEL"
        fi
    else
        sketchybar --set $NAME \
            background.color=0x44FFFFFF \
            label.shadow.drawing=off \
            icon.shadow.drawing=off \
            background.border_width=0 \
            icon="$WORKSPACE_NUM" \
            label="$LABEL"
    fi
fi
