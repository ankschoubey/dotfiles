# pnpm-only

Enforce pnpm, block `npm` / `npx` in agent shell calls.

## Why

Shell muscle memory drifts back to npm (`npm install`, `npx tsc`).
This plugin fails fast with the pnpm equivalent instead.

## Location

Global: `~/.config/opencode/plugins/pnpm-only.ts`
Export: `PnpmOnly`
Auto-loaded at startup, no config entry needed.

## Hook

- `tool.execute.before` — inspects `bash` / `shell` / `execute` commands,
  throws on whole-word `npm` / `npx`. `pnpm` never matches
  (char before `n` is `p`, not a separator).

## Behavior

| Command | Result |
|---|---|
| `npm install` | Blocked, suggests `pnpm install` |
| `npx tsc` | Blocked, suggests `pnpm dlx` |
| `cd x && npm test` | Blocked (chained still matches) |
| `pnpm install` / `pnpm dlx tsc` | Allowed |
| `read` / other tools | Ignored |

Error: `Blocked: "npm" is not allowed. Use pnpm instead ...`

## Limits

- Advisory guardrail, not sandbox: agent can rename binary to bypass.
- `echo "npm"` in a string also trips the matcher (fail-closed by design).
- MCP servers launched via `npx` in `opencode.json` unaffected
  (hook only sees agent tool calls, not server startup).
- Restart opencode to load changes to this file.
