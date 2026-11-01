# tdd-guard

Nudge the agent toward test-first development when it edits a TypeScript source
file before the matching test or story file.

## Why

Agents happily write implementation first and tests later (or never). This plugin
watches `file.edited` events, remembers which source files changed without their
test/story counterpart being touched, and injects a hint into the next model
request telling the agent to load the `tdd` skill.

## Location

Global: `~/.config/opencode/plugins/tdd-guard.ts`
Export: `TddGuard`
Auto-loaded at startup, no config entry needed.

## Hooks

- `event` (`file.edited`) — tracks source files edited without a matching test
  edit, and clears them once the test/story file is edited.
- `experimental.chat.system.transform` — appends a `## TDD guard` section to the
  system prompt while at least one source file is pending.

## Matching rules

A file counts as a source file when it ends in `.ts` / `.tsx` and is not:

- a test or story: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`,
  `*.stories.ts`, `*.stories.tsx`
- a declaration file: `*.d.ts`
- inside `node_modules`, `.git`, `dist`, `build`, `.next`

`src/foo.ts` matches any of:

```
src/foo.test.ts   src/foo.test.tsx
src/foo.spec.ts   src/foo.spec.tsx
src/foo.stories.ts src/foo.stories.tsx
```

Editing any of those clears the pending hint for `src/foo.ts`.

## Output

System prompt injection (only while pending):

```
## TDD guard

Source files edited before their matching test/story file:
- /repo/src/foo.ts (no matching test file yet)

Follow the `tdd` skill: use the skill tool with id `tdd`, then write or update the test
(.test.ts / .test.tsx / .stories.tsx) before continuing implementation. Test-first, red-green-refactor.
```

Existing tests are reported as `(matching test exists but was not updated first)`.

## State

Process-local, keyed by file path, not session. `file.edited` carries no session
ID, so a hint can outlive the session that caused it until the test is edited or
opencode restarts. Restart opencode to clear.

## Limits

- Advisory, not enforcement: the agent can ignore the hint.
- Only agent edits fire `file.edited`; manual editor changes do not (that is
  `file.watcher.updated`, intentionally not hooked).
- Requires the `tdd` skill to exist for the hint to be actionable.
