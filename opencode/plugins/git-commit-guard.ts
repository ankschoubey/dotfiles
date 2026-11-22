import { Plugin } from "@opencode/plugin"

// Block `git commit --no-verify` / `git commit -n`: hooks must always run.
function stripQuoted(command: string): string {
  return command.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, " ")
}

function isBypassedCommit(command: string): boolean {
  const code = stripQuoted(command)
  if (!/\bgit\b[\s\S]*\bcommit\b/.test(code)) return false
  if (/(^|[\s=])--no-verify\b/.test(code)) return true
  const afterCommit = code.slice(code.search(/\bcommit\b/) + "commit".length)
  return /(^|\s)-[a-zA-Z]*n[a-zA-Z]*(\s|$|=)/.test(afterCommit)
}

function findCommand(input: unknown): string {
  if (typeof input === "string") return input
  if (input && typeof input === "object") {
    const rec = input as Record<string, unknown>
    for (const key of ["command", "cmd", "script", "input", "text"]) {
      const value = rec[key]
      if (typeof value === "string" && value.length > 0) return value
    }
    for (const value of Object.values(rec)) {
      if (typeof value === "string" && value.includes("git")) return value
    }
  }
  return ""
}

function checkCommand(command: string): void {
  if (!command) return
  if (isBypassedCommit(command)) {
    throw new Error(
      `Blocked: "git commit --no-verify" / "-n" bypasses hooks. Commit without it so hooks run. Offending command: ${command}`,
    )
  }
}

// V1 entrypoint (opencode 1.x): kept for backward compat.
async function server() {
  return {
    "tool.execute.before": async (input: { tool?: string }, output: { args?: Record<string, unknown> }) => {
      if (input.tool !== "bash" && input.tool !== "shell" && input.tool !== "execute") {
        return
      }
      const args = output.args ?? {}
      const command =
        (args["command"] as string | undefined) ??
        (args["cmd"] as string | undefined) ??
        (args["script"] as string | undefined) ??
        ""
      checkCommand(command)
    },
  }
}

export default {
  ...Plugin.define({
    id: "git-commit-guard",
    async setup(ctx) {
      await ctx.tool.hook("execute.before", (event) => {
        const evt = event as { tool?: string; input?: unknown }
        const command = findCommand(evt.input)
        if (!command) return
        checkCommand(command)
      })
    },
  }),
  server,
}
