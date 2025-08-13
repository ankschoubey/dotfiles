#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Search Email
# @raycast.mode compact
#
# Optional parameters:
# @raycast.icon 📧
# @raycast.packageName search
# @raycast.argument1 { "type": "text", "placeholder": "Search query" }

open "https://mail.google.com/mail/u/0/#search/${1// /+}"
