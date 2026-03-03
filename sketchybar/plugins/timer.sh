#!/usr/bin/env bash

TIMER_FILE="$HOME/.workspace_timers.json"

get_timers() {
    if [[ -f "$TIMER_FILE" ]]; then
        cat "$TIMER_FILE"
    else
        echo "{}"
    fi
}

set_timer() {
    local workspace="$1"
    local duration="$2"
    local complete_action="$3"
    
    local now
    now=$(date +%s)
    
    local timers
    timers=$(get_timers)
    
    if [[ "$timers" == "{}" ]] || [[ -z "$timers" ]]; then
        timers="{}"
    fi
    
    local timer_json
    timer_json=$(jq -n \
        --argjson dur "$duration" \
        --argjson start "$now" \
        --arg act "$complete_action" \
        '{
            duration: $dur,
            start: $start,
            complete_action: $act,
            active: true
        }')
    
    timers=$(echo "$timers" | jq --arg wid "$workspace" --argjson timer "$timer_json" \
        '.[$wid] = $timer')
    
    echo "$timers" > "$TIMER_FILE"
}

clear_timer() {
    local workspace="$1"
    
    local timers
    timers=$(get_timers)
    timers=$(echo "$timers" | jq --arg wid "$workspace" 'del(.[$wid])')
    
    echo "$timers" > "$TIMER_FILE"
}

get_timer() {
    local workspace="$1"
    local timers
    timers=$(get_timers)
    echo "$timers" | jq --arg wid "$workspace" '.[$wid]'
}

get_timer_state() {
    local workspace="$1"
    local timer_json
    timer_json=$(get_timer "$workspace")
    
    if [[ "$timer_json" == "null" ]] || [[ -z "$timer_json" ]]; then
        echo "inactive"
        return
    fi
    
    local active
    active=$(echo "$timer_json" | jq -r '.active')
    
    if [[ "$active" == "false" ]]; then
        echo "completed"
        return
    fi
    
    local now duration start
    now=$(date +%s)
    duration=$(echo "$timer_json" | jq -r '.duration')
    start=$(echo "$timer_json" | jq -r '.start')
    
    local elapsed=$((now - start))
    local remaining=$((duration - elapsed))
    
    if [[ $remaining -le 0 ]]; then
        echo "expired"
    else
        echo "active:$remaining"
    fi
}

get_timer_display() {
    local workspace="$1"
    local state
    state=$(get_timer_state "$workspace")
    
    if [[ "$state" == "inactive" ]]; then
        return
    fi
    
    if [[ "$state" == "completed" ]]; then
        local timer_json
        timer_json=$(get_timer "$workspace")
        local complete_action
        complete_action=$(echo "$timer_json" | jq -r '.complete_action')
        
        if [[ "$complete_action" == "alert" ]]; then
            echo "alert"
        else
            local duration
            duration=$(echo "$timer_json" | jq -r '.duration')
            format_time "$duration"
        fi
        return
    fi
    
    if [[ "$state" == "expired" ]]; then
        local timer_json
        timer_json=$(get_timer "$workspace")
        
        local complete_action
        complete_action=$(echo "$timer_json" | jq -r '.complete_action')
        
        echo "$timer_json" | jq --argjson now "$(date +%s)" \
            '.start as $s | .duration as $d | .complete_action as $ca |
            if $ca == "alert" then "alert"
            else ((.duration - (now - .start)) | if . < 0 then .duration else . end) | tostring | .[0:4] end' 2>/dev/null
        
        if [[ "$complete_action" == "alert" ]]; then
            echo "alert"
        else
            local duration
            duration=$(echo "$timer_json" | jq -r '.duration')
            format_time "$duration"
        fi
        return
    fi
    
    local remaining="${state#active:}"
    format_time "$remaining"
}

format_time() {
    local total_seconds="$1"
    
    local hours minutes seconds
    hours=$((total_seconds / 3600))
    minutes=$(((total_seconds % 3600) / 60))
    seconds=$((total_seconds % 60))
    
    if [[ $hours -gt 0 ]]; then
        printf "%d:%02d:%02d" "$hours" "$minutes" "$seconds"
    else
        printf "%d:%02d" "$minutes" "$seconds"
    fi
}

expire_timer() {
    local workspace="$1"
    
    local timers
    timers=$(get_timers)
    
    local complete_action
    complete_action=$(echo "$timers" | jq -r --arg wid "$workspace" '.[$wid].complete_action // "alert"')
    
    if [[ "$complete_action" == "alert" ]]; then
        timers=$(echo "$timers" | jq --arg wid "$workspace" \
            '.[$wid].active = false')
        echo "$timers" > "$TIMER_FILE"
    fi
}

get_next_expiry() {
    local timers
    timers=$(get_timers)
    
    local now
    now=$(date +%s)
    
    local next_expiry=""
    
    echo "$timers" | jq -r 'to_entries[] | select(.value.active == true) | 
        (.key | tonumber) as $wid |
        (.value.start + .value.duration) as $expiry |
        {workspace: $wid, expiry: $expiry}' | jq -s '
        map(select(.expiry > '"$now"')) |
        sort_by(.expiry) |
        first // empty
    '
}

case "$1" in
    set)
        set_timer "$2" "$3" "$4"
        ;;
    clear)
        clear_timer "$2"
        ;;
    get)
        get_timer "$2"
        ;;
    state)
        get_timer_state "$2"
        ;;
    display)
        get_timer_display "$2"
        ;;
    expire)
        expire_timer "$2"
        ;;
    next-expiry)
        get_next_expiry
        ;;
    *)
        echo "Usage: timer.sh {set|clear|get|state|display|expire|next-expiry} [workspace] [duration] [complete_action]"
        ;;
esac
