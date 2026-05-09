---
name: ralph-loop-creator
description: Create new ralph loop scripts — iterative bash loops that run a command, check output for errors/failures, and call `opencode run "Fix..."` to auto-fix. Trigger when user says "create a ralph script", "new ralph loop", "make a ralph for X", "ralph loop for Y", or similar. Also if user describes wanting an auto-fixing loop for any tool that produces error output (linters, test runners, type checkers, formatters, etc.).
compatibility:
  - bash
---

# ralph-loop-creator

Creates ralph loop scripts — the iterative fix loops in `$DOTFILES_ROOT/scripts/ralphjs-*.sh`.

These scripts loop up to 200x: run a command → check output → if error, `opencode run "Fix..."` → repeat until clean.

## Workflow

1. **Interview** — ask user to clarify the loop they need
2. **Generate** — write the script matching existing conventions
3. **Install** — place at chosen path, `chmod +x`

## Terminal notification

Add `terminal-notifier` for macOS notifications — these loops run long (200 iterations), user walks away, needs ping when done.

Two notification points:
- **Pass**: loop breaks early → "Ralph loop `<name>` passed!"
- **Exhausted**: loop hits MAX_ITER → "Ralph loop `<name>` maxed out (200 iterations)"

Use `terminal-notifier -title "Ralph <name>" -message "..." -sound default` — title includes the script name so user knows which loop finished.

Ask user to choose install method for terminal-notifier if not present:
```bash
brew install terminal-notifier
```

## Interview questions

Ask each. Infer from context when obvious. Skip what's already clear.

1. **What command/tool should the loop run?**
   - e.g., `npx eslint .`, `npx vitest`, `npx tsc --noEmit`, `npx jscpd src`
   - Note: does it need `| head -n 50` to limit output? e.g., eslint and jscpd use it.

2. **What output indicates failure vs success?**
   - e.g., `" error "`, `"1 failed"`, `"Clone found "`, `"error TS"`, non-zero exit
   - If unsure, ask what a failure message looks like in the tool's output.
   - Default: check exit code with `$?` if no specific string match.

3. **What fix prompt should opencode receive?**
   - Default: `"Fix <command> output: $output"` — good enough.
   - User can customize (e.g., "Fix failing e2e test", "Fix code duplication").

4. **Does the loop need setup/teardown?**
   - e.g., start dev server before loop, kill after. Check ralphjs-fix-e2e.sh for pattern.
   - e.g., read work items from a file. Check ralphjs-mutation-fix.sh for pattern.
   - If args needed (like test file path), add `$1` arg parsing.

5. **Script name?**
   - Convention: `ralphjs-<tool>.sh` — use the tool name from the command.
   - If no clear tool name, ask the user.

6. **Install location?**
   - Ask: local (`./scripts/`) or global (`$DOTFILES_ROOT/scripts/`)?
   - If both exist, list both and let user pick.

## Script template

Generate a script following this template, adapting for specifics:

```bash
#!/bin/bash

# Ralph loop for <description>
# Usage: ./ralphjs-<name>.sh [args]

MAX_ITER=200
i=1
PASSED=false

# Optional: arg parsing
# if [ $# -eq 0 ]; then
#     echo "Usage: $0 <arg>"
#     exit 1
# fi
# ARG=$1

# Optional: setup (start server, etc.)
# <setup>

while [ $i -le $MAX_ITER ]; do
    ((i++))

    # Kill existing processes that might hold ports/locks
    pkill node 2>/dev/null || true

    # Optional: per-iteration echo
    # echo "Iteration $i: <description>"

    output=$(<command> 2>&1)

    # Optional: post-command cleanup
    # pkill node 2>/dev/null || true

    if [[ "$output" == *"<failure-marker>"* ]]; then
        opencode run "<fix prompt>: $output"
    else
        echo "Passed!"
        PASSED=true
        break
    fi
done

if [ "$PASSED" = true ]; then
    terminal-notifier -title "Ralph <name>" -message "Passed!"
else
    terminal-notifier -title "Ralph <name>" -message "Maxed out (200 iterations)"
fi
```

Remove optional sections if not needed. If exit code check is better than string match, use:
```bash
if [ $? -ne 0 ]; then
```

## Post-generation

1. Make executable: `chmod +x <script-path>`
2. Confirm to user: "Created ralph loop at <path>. Run with `s <name>` or `re` (fzf picker)."
3. Note: `re` alias in `.zshrc` already discovers `ralph*.sh` scripts via fzf.
