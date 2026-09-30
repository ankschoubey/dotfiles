# dotfiles

macOS workstation config: zsh, AeroSpace, Sketchybar, Raycast, Ghostty.

## Layout

Logic lives in `scripts/`. `raycast/scripts/` holds thin wrappers whose only job is to
carry `@raycast` headers and delegate to `scripts/`. Put new launcher logic in
`scripts/`, not `raycast/scripts/`.

Raycast TypeScript extensions live in `raycast/<name>/`, each with its own
`CONTEXT.md` for domain terms. Build with `ray develop` / `ray build`.

## Launched scripts

Raycast, AeroSpace, and `brew services` all launch scripts through **launchd**, not
your shell. launchd's `PATH` is the bare macOS default, so anything your interactive
shell adds is invisible to them.

`.zshrc` extends `PATH` past what launchd provides — `~/.local/bin` (holds `agent`),
`/opt/homebrew/bin`, `~/.bun/bin`, `~/Library/pnpm/bin`.

**Consequence:** a script that works when you run it in a terminal fails when
Raycast or AeroSpace runs it, with `command not found`.

Two fixes, both used in `scripts/`:

- **Absolute path** to the binary, when you know it (`scripts/pick-next-session.sh`)
- **`export PATH="$HOME/.local/bin:$PATH"`** at the top, when the script also calls
  other dev tools. See `docs/adr/0001-launchd-paths-in-scripts.md`.

`raycast/scripts/toggle-wallpaper.sh`, `quit-aerospace.sh`, and `restart-aerospace.sh`
`source ~/.zshrc` instead. That works but is slow and pulls in every interactive
side effect, so prefer one of the two above.

## Verify a script the way it will actually run

Your shell's environment is the one place these bugs stay invisible. Test with the
environment stripped:

```bash
env -i HOME="$HOME" PATH="/usr/bin:/bin:/usr/sbin:/sbin" scripts/<name>.sh
```

Compare against running it bare. Any difference is a bug Raycast will hit.

Before claiming an environment fact holds, run the command. "Should resolve" is a
hypothesis, not a finding.

## Interactive programs in a new terminal

Ghostty cannot open a window from its CLI on macOS — use
`open -na Ghostty --args ...`. Working openers to copy: `scripts/trello-analytics.sh`,
`scripts/handle_inbox.sh`, `scripts/start-ghostty.sh`.

`-e zsh -c "..."` gives the program a non-interactive shell with no TTY, so TUIs
break. `-e <script>` execs the script directly as the terminal's program, which gives
it a real PTY. The cost: when the program exits the window closes. Add `exec zsh` at
the end of a `-c` string if you need the shell to survive instead.

## Gotchas

- `$DOTFILES_ROOT` is exported from `.zshrc`, so it is **absent** from launchd too.
  `aerospace/.aerospace.toml` uses it in `exec-and-forget` bindings; hardcode the path
  in anything launchd runs.
- `start-at-login = false` in `aerospace/.aerospace.toml` disables the whole
  `after-startup-command` block, including the `brew services start sketchybar` /
  `borders` entries.
- Raycast script commands need a manual re-index in the Raycast UI before a new or
  renamed one appears.
- Manifests reference icons that aren't committed (`system-quit/quit-icon.png`,
  `display-resolution/display-icon.png`, `workspace-switcher/workspace-icon.png`,
  `wallpaper-changer/wallpaper-icon.png`, `dayone-journals/dayone-icon.png`).

## Tooling

No CI, no pre-commit hooks, no root `package.json`. `shellcheck` and `shfmt` are not
installed. Scripts are verified by running them — see above.