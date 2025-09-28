#!/bin/zsh
# Raycast Script Command Template
#
# Duplicate this file and remove ".template." from the filename to get started.
# See full documentation here: https://github.com/raycast/script-commands
#
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle Wallpaper
# @raycast.mode inline 
#
# Optional parameters:
# @raycast.icon 🏞️
# @raycast.packageName Raycast Scripts
source ~/.zshrc
$DOTFILES_ROOT/scripts/toggle-wallpaper.sh
