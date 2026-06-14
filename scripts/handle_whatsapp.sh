#!/bin/bash

if ! pgrep -x "WhatsApp" >/dev/null; then
    open -a /Applications/WhatsApp.app
    for i in $(seq 1 20); do
        WID=$(aerospace list-windows --monitor all --app-id net.whatsapp.WhatsApp --format '%{window-id}' | head -1)
        if [ -n "$WID" ]; then
            break
        fi
        sleep 0.5
    done
    osascript -e 'tell app "WhatsApp" to activate'
    exit 0
fi

WID=$(aerospace list-windows --monitor all --app-id net.whatsapp.WhatsApp --format '%{window-id}' | head -1)

if [ -z "$WID" ]; then
    osascript -e 'quit app "WhatsApp"'
    sleep 1
    open -a /Applications/WhatsApp.app
    for i in $(seq 1 20); do
        WID=$(aerospace list-windows --monitor all --app-id net.whatsapp.WhatsApp --format '%{window-id}' | head -1)
        if [ -n "$WID" ]; then
            break
        fi
        sleep 0.5
    done
    osascript -e 'tell app "WhatsApp" to activate'
    exit 0
fi

CURRENT_WS=$(aerospace list-workspaces --focused)
WHATSAPP_WS=$(aerospace list-windows --monitor all --app-id net.whatsapp.WhatsApp --format '%{workspace}' | head -1)

if [ "$WHATSAPP_WS" = "$CURRENT_WS" ]; then
    osascript -e 'quit app "WhatsApp"'
    exit 0
fi

aerospace move-node-to-workspace "$CURRENT_WS" --window-id "$WID"
osascript -e 'tell app "WhatsApp" to activate'
