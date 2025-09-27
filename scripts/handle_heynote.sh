if ! pgrep -x "Heynote" >/dev/null; then open -a /Applications/Heynote.app; fi
AEROSPACE_FOCUSED_WORKSPACE=$(aerospace list-workspaces --focused)
aerospace move-node-to-workspace "$AEROSPACE_FOCUSED_WORKSPACE"