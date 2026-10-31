import type { Plugin } from "@opencode-ai/plugin"

// Enforce pnpm-only: block npm/npx in shell tool calls, suggest pnpm equivalent.
export const PnpmOnly: Plugin = async () => {
  // Matches npm/npx as standalone commands (incl. chained, quoted, absolute paths)
  // but NOT pnpm: char before n must be start/separator, so "pnpm" never matches.
  const BLOCKED = /(^|[\s;&|(`'"]|\/)(npm|npx)\b/

  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash" && input.tool !== "shell" && input.tool !== "execute") {
        return
      }
      const args = (output as { args?: Record<string, unknown> }).args ?? {}
      const command =
        (args["command"] as string | undefined) ??
        (args["cmd"] as string | undefined) ??
        (args["script"] as string | undefined) ??
        ""
      if (typeof command !== "string" || command.length === 0) {
        return
      }
      const match = command.match(BLOCKED)
      if (match) {
        const used = match[2]
        throw new Error(
          `Blocked: "${used}" is not allowed. Use pnpm instead (pnpm install, pnpm add, pnpm dlx). Offending command: ${command}`,
        )
      }
    },
  }
}
