#!/bin/bash

# Raycast Script Command Template
#
# Duplicate this file and remove ".template." from the filename to get started.
# See full documentation here: https://github.com/raycast/script-commands
#
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Quit All Apps and Shutdown
# @raycast.mode inline
#
# Optional parameters:
# @raycast.icon 🔌
# @raycast.packageName Raycast Scripts

open raycast://extensions/raycast/system/quit-all-apps
sleep 2
open raycast://extensions/raycast/system/shut-down
