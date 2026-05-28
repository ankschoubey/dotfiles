---
name: opencode-hooks
description: Create opencode plugins/hooks to extend AI coding agent behavior. Covers event hooks, custom tools, environment injection, compaction, notifications. Use when user says "create a hook", "opencode plugin", "custom tool", "plugin for opencode", "hook into opencode", or asks to extend/modify opencode behavior.
---

# opencode-hooks

## API Reference (source of truth)

Always fetch current plugin API before generating code:

```
https://raw.githubusercontent.com/anomalyco/opencode/refs/heads/dev/packages/web/src/content/docs/plugins.mdx
```

Covers: loading plugins, basic structure, events list, TS types, dependencies, examples.

## Quick reference

| Hook pattern | Fires |
|---|---|
| `tool.execute.before` | Before any tool call |
| `tool.execute.after` | After any tool call |
| `shell.env` | Before shell execution |
| `session.*` | Session lifecycle |
| `experimental.session.compacting` | Context compaction |

## Workflow

1. **Determine hook type** — what event to subscribe to?
2. **Fetch plugin docs** — get current API from URL above
3. **Determine location** — project (`.opencode/plugins/`) or global (`~/.config/opencode/plugins/`)
4. **Generate** — single `.js`/`.ts` file, one export per plugin function
5. **Install deps if needed** — add `package.json` in same directory as plugin
