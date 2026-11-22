import { Plugin } from "@opencode/plugin"

// Enforce pnpm-only: block npm/npx in shell tool calls, suggest pnpm equivalent.
const BLOCKED = /(^|[\s;&|(`'"]|\/)(npm|npx)\b/

function findCommand(input: unknown): string {
  if (typeof input === "string") return input
  if (input && typeof input === "object") {
    const rec = input as Record<string, unknown>
    for (const key of ["command", "cmd", "script", "input", "text"]) {
      const value = rec[key]
      if (typeof value === "string" && value.length > 0) return value
    }
    for (const value of Object.values(rec)) {
      if (typeof value === "string" && BLOCKED.test(value)) return value
    }
  }
  return ""
}

function checkCommand(command: string): void {
  if (!command) return
  const match = command.match(BLOCKED)
  if (match) {
    throw new Error(
      `Blocked: "${match[2]}" is not allowed. Use pnpm instead (pnpm install, pnpm add, pnpm dlx). Offending command: ${command}`,
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
    id: "pnpm-only",
    async setup(ctx) {
      await ctx.tool.hook("execute.before", (event) => {
        const evt = event as { tool?: string; input?: unknown }
        // Gate shell-like tools; fail-closed on any tool carrying an npm/npx command string.
        if (evt.tool !== "bash" && evt.tool !== "shell" && (evt.tool ?? "").length > 0) {
          // Still scan: some versions name shell tool `shell`, others `bash`.
          // Only skip tools with no command-like input.
          const command = findCommand(evt.input)
          if (!command) return
          checkCommand(command)
          return
        }
        checkCommand(findCommand(evt.input))
      })
    },
  }),
  server,
}
