#!/bin/bash

# Function to set wallpaper
set_wallpaper() {
    osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$1\""
}

# Get the list of wallpapers
WALLPAPERS_DIR="$DOTFILES_ROOT/wallpaper"
WALLPAPERS=("$WALLPAPERS_DIR"/*)

# Get the current wallpaper
CURRENT_WALLPAPER=$(osascript -e 'tell application "System Events" to get picture of every desktop')

# Find the index of the current wallpaper
for i in "${!WALLPAPERS[@]}"; do
    if [[ "$CURRENT_WALLPAPER" == *"${WALLPAPERS[$i]}"* ]]; then
        CURRENT_INDEX=$i
        break
    fi
done

# Calculate the index of the next wallpaper
NEXT_INDEX=$(( (CURRENT_INDEX + 1) % ${#WALLPAPERS[@]} ))

# Set the next wallpaper
set_wallpaper "${WALLPAPERS[$NEXT_INDEX]}"
