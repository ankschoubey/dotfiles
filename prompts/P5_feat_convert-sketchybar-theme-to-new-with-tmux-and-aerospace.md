# P5: Convert Sketchybar Theme to New with Tmux and Aerospace

## Overview
Convert the existing sketchybar theme to the new Catppuccin-inspired theme from `new-sketchybar/`, while preserving the tmux counter visibility and ensuring aerospace integration works properly.

## Key Differences
- **Current theme** (`sketchybar-bk/sketchybarrc`): Single config with aerospace workspaces, tmux counter, dark colors, items like context, app_count, battery, swap.
- **New theme** (`new-sketchybar/`): Wrapper script sourcing laptop/desktop configs, Catppuccin colors, simpler items (current_space, front_app, weather, clock, etc.), uses `space_change` event.

## Requirements
- Keep tmux counter visible (from `sketchybar-bk/plugins/tmux.sh`).
- Ensure aerospace workspaces and events work.
- Adopt new theme's styling and colors.

## Conversion Steps
1. **Backup**: Renamed `sketchybar` to `sketchybar-bk`.
2. **Replace base config**: Use `new-sketchybar/sketchybarrc` as wrapper.
3. **Copy configs**: Add `sketchybarrc-laptop` and `sketchybarrc-desktop` from `new-sketchybar`.
4. **Integrate aerospace**: Add `aerospace_workspace_change` event, replace `current_space` with workspace loop, add separators and subscriptions.
5. **Add tmux counter**: Insert `tmux_sessions` item styled for new theme.
6. **Copy plugins**: Move plugins from `new-sketchybar/plugins*` to `sketchybar/plugins*`, keep existing ones like `tmux.sh`, `aerospace.sh`.
7. **Update styles**: Ensure colors match Catppuccin (e.g., 0xffcad3f5 for labels).
8. **Test**: Reload sketchybar, verify aerospace switching and tmux updates.

## Files Involved
- `sketchybar/sketchybarrc` (new wrapper)
- `sketchybar/sketchybarrc-laptop` (modified)
- `sketchybar/sketchybarrc-desktop` (modified)
- `sketchybar/plugins/` (updated)

## Notes
- Assumes new plugins are compatible; adapt if needed.
- Test on both laptop and desktop configs.