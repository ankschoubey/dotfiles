# @raycast/system-quit

## Domain terms

**Quit target** — a thing that can be quit (Docker container, tmux session, workspace apps). Has a name, icon, section, and either an `action` (quit function) or `submenu` (sub-view for managing nested items).

**Shell command** — a single module that constructs and runs shell commands. Encapsulates PATH prefix, binary resolution, and script paths. Single source of truth for `brew` prefix and dotfiles directory.

**Quit orchestration** — the lifecycle of quitting: optional confirmation dialog, animated toast during execution, then success/failure toast. Shared by all quit targets.

**Target registry** — the `targets` array that defines all available quit targets. Each target has a `section` for grouping and either `action` or `submenu` variant.

**Workspace state** — the current Aerospace workspace (name, window count, window names).
