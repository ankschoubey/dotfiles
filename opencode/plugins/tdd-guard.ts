import { existsSync } from "node:fs"
import type { Plugin } from "@opencode-ai/plugin"

// TDD guard: when the agent edits a .ts/.tsx source file before its matching
// .test.ts/.test.tsx/.stories.tsx file, inject a hint to follow test-first TDD.

const SOURCE_FILE = /\.(ts|tsx)$/
const TEST_OR_STORY_FILE = /\.(test|spec|stories)\.(ts|tsx)$/
const IGNORED_DIRS = ["node_modules", "/.git/", "/dist/", "/build/", "/.next/"]
const TEST_SUFFIXES = [
  ".test.ts",
  ".test.tsx",
  ".spec.ts",
  ".spec.tsx",
  ".stories.ts",
  ".stories.tsx",
]

function isSourceFile(file: string): boolean {
  if (!SOURCE_FILE.test(file)) return false
  if (TEST_OR_STORY_FILE.test(file)) return false
  if (file.endsWith(".d.ts")) return false
  return !IGNORED_DIRS.some((dir) => file.includes(dir))
}

function isTestFile(file: string): boolean {
  return TEST_OR_STORY_FILE.test(file)
}

function stemOf(file: string): string {
  return file.endsWith(".tsx") ? file.slice(0, -".tsx".length) : file.slice(0, -".ts".length)
}

function testCandidates(file: string): string[] {
  const stem = stemOf(file)
  return TEST_SUFFIXES.map((suffix) => stem + suffix)
}

// Sources whose matching test file has not been touched in this process yet.
const pending = new Set<string>()
// Test/story files touched in this process.
const touchedTests = new Set<string>()

export const TddGuard: Plugin = async ({ client, directory }) => {
  await client.app.log({
    body: {
      service: "tdd-guard",
      level: "debug",
      message: "TDD guard loaded",
      extra: { directory },
    },
  })

  return {
    event: async ({ event }) => {
      if (event.type !== "file.edited") return
      const file = event.properties.file
      if (!file) return

      if (isTestFile(file)) {
        touchedTests.add(file)
        for (const source of pending) {
          if (testCandidates(source).includes(file)) pending.delete(source)
        }
        return
      }

      if (!isSourceFile(file)) return
      // Test exists on disk but was not modified first: still a TDD violation.
      if (testCandidates(file).some((candidate) => touchedTests.has(candidate))) return
      pending.add(file)
    },

    "experimental.chat.system.transform": async (_input, output) => {
      if (pending.size === 0) return
      const files = [...pending].slice(0, 5)
      const list = files
        .map((file) => {
          const hasTest = testCandidates(file).some((candidate) => existsSync(candidate))
          return hasTest
            ? `- ${file} (matching test exists but was not updated first)`
            : `- ${file} (no matching test file yet)`
        })
        .join("\n")
      const more = pending.size > files.length ? `\n- (+${pending.size - files.length} more)` : ""
      output.system.push(
        [
          "## TDD guard",
          "",
          "Source files edited before their matching test/story file:",
          list + more,
          "",
          "Follow the `tdd` skill: use the skill tool with id `tdd`, then write or update the test",
          "(.test.ts / .test.tsx / .stories.tsx) before continuing implementation. Test-first, red-green-refactor.",
        ].join("\n"),
      )
    },
  }
}
