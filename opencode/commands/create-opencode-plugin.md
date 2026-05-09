Create a new OpenCode plugin with proper structure and documentation.

## Setup

Step 1: Ask user for plugin name (required)
Step 2: Ask user for plugin description (optional)
Step 3: Ask user for initial hooks (optional, comma-separated)

## File Structure

Create plugin file at `~/.config/opencode/plugins/{plugin-name}.ts`:

```typescript
import type { Plugin } from "@opencode-ai/plugin"

// {description or 'Plugin description'}
export const {PluginName}: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    // Add hooks here
  }
}
```

Replace `{PluginName}` with PascalCase version of plugin name.

## Hook Options

Available hooks to suggest:

**Session Events:**
- `session.created` - New session started
- `session.idle` - Session completed
- `session.updated` - Session state changed
- `session.diff` - Session diff generated

**Tool Events:**
- `tool.execute.before` - Before tool execution (can modify input/output)
- `tool.execute.after` - After tool execution

**Shell Events:**
- `shell.env` - Modify environment variables for shell execution

**File Events:**
- `file.edited` - File was modified
- `file.watcher.updated` - File watcher detected changes

**Message Events:**
- `message.updated` - Message content changed
- `message.part.updated` - Message part updated

**LSP Events:**
- `lsp.updated` - LSP state updated
- `lsp.client.diagnostics` - LSP diagnostics available

## Custom Tools

For plugins with custom tools:

```typescript
import { type Plugin, tool } from "@opencode-ai/plugin"

export const {PluginName}: Plugin = async (ctx) => {
  return {
    tool: {
      myTool: tool({
        description: "Tool description",
        args: {
          param: tool.schema.string(),
        },
        async execute(args, context) {
          const { directory, worktree } = context
          return `Result`
        },
      }),
    },
  }
}
```

## Dependencies

For external npm packages, add to `~/.config/opencode/package.json`:

```json
{
  "dependencies": {
    "package-name": "^1.0.0"
  }
}
```

## Examples to Create

Based on user's needs, scaffold example plugins:

1. **Notification plugin** - Send system notifications on events
2. **Env protection** - Block access to sensitive files
3. **Env injection** - Inject environment variables into shells
4. **Custom tool** - Add a custom tool to opencode
5. **Compaction hook** - Customize session compaction context

## Testing

After creating plugin:
1. Restart opencode to load the plugin
2. Verify plugin loads without errors
3. Test the hook functionality

## Documentation

Add a README.md in the plugin file directory with:
- Plugin purpose
- Configuration options
- Hooks used
- Examples of output/behavior
