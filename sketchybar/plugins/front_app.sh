#!/usr/bin/env bash

detect_git_branch() {
  local app="$1"
  local pid cwd branch title project child_pid

  pid=$(osascript -e 'tell application "System Events" to get unix id of first process whose frontmost is true' 2>/dev/null)
  [ -z "$pid" ] && return

  output_git() {
    local dirty
    dirty=$(git -C "$cwd" status --porcelain 2>/dev/null)
    if [ -n "$dirty" ]; then echo "$branch ●"; else echo "$branch"; fi
  }

  check_git() {
    [ -z "$1" ] || [ "$1" = "/" ] && return 1
    branch=$(git -C "$1" rev-parse --abbrev-ref HEAD 2>/dev/null) || return 1
    cwd="$1"
    return 0
  }

  # Strategy 1: CWD of frontmost process
  cwd=$(lsof -p "$pid" -d cwd 2>/dev/null | awk 'NR>1 {print $NF}')
  check_git "$cwd" && { output_git; return; }

  # Strategy 2: App-specific APIs
  case "$app" in
    "iTerm2")
      cwd=$(osascript -e 'tell application "iTerm2" to tell current session of current window to get variable "sessionPath"' 2>/dev/null)
      check_git "$cwd" && { output_git; return; }
      ;;
    "Warp")
      command -v warp-cli &>/dev/null && cwd=$(warp-cli current-path 2>/dev/null) && check_git "$cwd" && { output_git; return; }
      ;;
  esac

  # Strategy 3: Walk process tree (terminals run shell as child)
  child_pid="$pid"
  for _ in 1 2 3; do
    child_pid=$(pgrep -P "$child_pid" 2>/dev/null | head -1)
    [ -z "$child_pid" ] && break
    cwd=$(lsof -p "$child_pid" -d cwd 2>/dev/null | awk 'NR>1 {print $NF}')
    check_git "$cwd" && { output_git; return; }
  done

  # Strategy 4: Parse editor window titles, search common dirs
  title=$(osascript -e 'tell application "System Events" to get title of first window of (first process whose frontmost is true)' 2>/dev/null)
  [ -z "$title" ] && return

  project=$(echo "$title" | sed -n 's/.*— \([^—]*\) —.*/\1/p')
  [ -z "$project" ] && project=$(echo "$title" | sed 's/ —.*//;s/ -.*//')
  [ -z "$project" ] || [ "$project" = "$title" ] && return

  for dir in "$HOME/dev" "$HOME/projects" "$HOME/code" "$HOME/src" "$HOME/Documents" "$HOME/workspace" "$HOME/git"; do
    [ -d "$dir/$project/.git" ] && check_git "$dir/$project" && { output_git; return; }
  done
}

if [ "$SENDER" = "front_app_switched" ]; then
  icon="$(~/.config/sketchybar/plugins/icon_map_fn.sh "$INFO")"
  label="$INFO"

  branch=$(detect_git_branch "$INFO")
  if [ -n "$branch" ]; then
    label="$INFO   $branch"
  fi

  sketchybar --set "$NAME" icon="$icon" label="$label"
fi
