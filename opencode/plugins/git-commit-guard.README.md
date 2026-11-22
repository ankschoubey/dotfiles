# git-commit-guard

Block `git commit --no-verify` / `git commit -n` in agent shell calls. Hooks must always run.

## Location

Global: `~/.config/opencode/plugins/git-commit-guard.ts`
Export: default `{ id: "git-commit-guard", setup, server }` (V2 + V1 compat)
Auto-loaded at startup, no config entry needed.

## Hook

- V2: `ctx.tool.hook("execute.before")` — inspects command input, throws on bypassed commit.
- V1: `tool.execute.before` — same check for opencode 1.x.

## Behavior

| Command | Result |
|---|---|
| `git commit -m "msg" --no-verify` | Blocked |
| `git commit -n -m "msg"` | Blocked |
| `git commit -amn "msg"` | Blocked |
| `git commit -m "msg"` | Allowed |
| `git commit -m "--no-verify"` | Allowed (quoted message text stripped before check) |

Error: `Blocked: "git commit --no-verify" / "-n" bypasses hooks. ...`

## Limits

- Advisory guardrail, not sandbox: agent can rename binary to bypass.
- Restart opencode to load changes to this file.
