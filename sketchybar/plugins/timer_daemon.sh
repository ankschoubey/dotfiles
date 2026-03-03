#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

update_sketchybar() {
    sketchybar --trigger timer_update 2>/dev/null
}

notify_completion() {
    local workspace="$1"
    local title="$2"
    local message="$3"
    
    if command -v terminal-notifier &> /dev/null; then
        terminal-notifier -title "$title" -message "$message" -sound default &
    elif command -v osascript &> /dev/null; then
        osascript -e 'display notification "'"$message"'" with title "'"$title"'" sound name "default"' &
    fi
}

process_expired_timers() {
    local timers
    timers=$(jq -s '.[0] // {}' "$HOME/.workspace_timers.json" 2>/dev/null || echo "{}")
    
    local now
    now=$(date +%s)
    
    echo "$timers" | jq -r 'to_entries[] | 
        select(.value.active == true) |
        .key as $wid |
        .value.start as $start |
        .value.duration as $dur |
        .value.complete_action as $ca |
        if (($start + $dur) <= '"$now"') then
            "\($wid)|\($ca)"
        else
            empty
        end
    ' | while IFS='|' read -r wid ca; do
        if [[ "$ca" == "alert" ]]; then
            "$SCRIPT_DIR/timer.sh" expire "$wid"
            notify_completion "Workspace Timer" "Timer on workspace $wid has completed!" "Timer on workspace $wid has completed!"
        fi
        update_sketchybar
    done
}

sleep_until_next_expiry() {
    local next_info
    next_info=$("$SCRIPT_DIR/timer.sh" next-expiry)
    
    if [[ -z "$next_info" ]] || [[ "$next_info" == "null" ]]; then
        sleep 60
        return
    fi
    
    local expiry workspace
    expiry=$(echo "$next_info" | jq -r '.expiry')
    workspace=$(echo "$next_info" | jq -r '.workspace')
    
    local now
    now=$(date +%s)
    
    local sleep_time=$((expiry - now))
    
    if [[ $sleep_time -lt 1 ]]; then
        sleep_time=1
    fi
    
    sleep "$sleep_time"
}

while true; do
    process_expired_timers
    sleep_until_next_expiry
done
