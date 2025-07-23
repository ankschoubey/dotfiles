#!/bin/bash
# Usage: claude_color_hook.sh <state>
set_bg() { echo -ne "\e]11;${1}\e\\"; }

case "$1" in
  thinking) set_bg "#cceeff" ;;   # light blue
  error)    set_bg "#ffcccc" ;;   # light red
  done)     set_bg "#ccffee" ;;   # mint green
  idle)     set_bg "#ffffcc" ;;   # light yellow
  default)  set_bg "#1e1e1e" ;;   # terminal default
  *)        echo >&2 "Usage: $0 {thinking|error|done|idle|default}"; exit 1 ;;
esac