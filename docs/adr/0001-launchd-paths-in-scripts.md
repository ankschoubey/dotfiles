# Scripts that launch other scripts export their own PATH

Scripts reached by Raycast, AeroSpace, or `brew services` run under **launchd**, not
your login shell. launchd's `PATH` is the bare macOS default, so the `PATH` extensions
in `.zshrc` — including `~/.local/bin`, where `agent` lives — are absent. A script that
works when you run it in a terminal then fails with `command not found` when a
launcher invokes it.

So scripts call binaries by absolute path, or `export PATH="$HOME/.local/bin:$PATH"`
at the top when they need several dev tools.

## Considered Options

- **`source ~/.zshrc`** — works, and three existing wrappers do it
  (`toggle-wallpaper.sh`, `quit-aerospace.sh`, `restart-aerospace.sh`). It is slow and
  pulls in every interactive side effect: `starship`, `zinit`, `jenv`, `carapace`.
  Correctness here is not worth a full interactive startup.
- **Relocating binaries** into `/opt/homebrew/bin`, which launchd *does* include —
  rejected as a global change to solve a handful of scripts.
- **Trusting the caller's environment** — rejected. This is the default assumption
  that produced the bug.

## Consequences

The `export PATH` line in a script looks redundant to anyone who reads `.zshrc` and
sees the same line there. It is not. Removing it reintroduces the failure, and the
failure only shows up in the launcher, not in a terminal.

The check that distinguishes the two environments is one command:

```bash
env -i HOME="$HOME" PATH="/usr/bin:/bin:/usr/sbin:/sbin" scripts/<name>.sh
```

Run it before claiming a script works. See the "Verify a script the way it will
actually run" section of `AGENTS.md`.

Note that `$DOTFILES_ROOT` has the same problem: `.zshrc` exports it, so it is also
absent under launchd. `aerospace/.aerospace.toml` uses it in `exec-and-forget`
bindings today, which is inconsistent with the above and worth revisiting.
