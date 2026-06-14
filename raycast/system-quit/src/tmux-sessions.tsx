import { List, Icon, showToast, Toast, Action, ActionPanel } from "@raycast/api";
import { useState, useEffect } from "react";
import { runBrewCommand } from "./shell";

export function TmuxSessionsList() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runBrewCommand("tmux", "list-sessions -F '#{session_name}' 2>/dev/null")
      .then((r) => setSessions(r.stdout.trim().split("\n").filter(Boolean)))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <List
      searchBarPlaceholder="Search tmux sessions..."
      navigationTitle="Tmux Sessions"
      isLoading={loading}
    >
      {sessions.map((session) => (
        <List.Item
          key={session}
          title={session}
          icon={Icon.Terminal}
          actions={
            <ActionPanel>
              <Action
                title="Kill Session"
                icon={Icon.Power}
                onAction={async () => {
                  await showToast({ style: Toast.Style.Animated, title: `Killing ${session}...` });
                  try {
                    await runBrewCommand("tmux", `kill-session -t "${session}"`);
                    setSessions((prev) => prev.filter((s) => s !== session));
                    await showToast({ style: Toast.Style.Success, title: `Killed ${session}` });
                  } catch (error) {
                    await showToast({
                      style: Toast.Style.Failure,
                      title: `Failed to kill ${session}`,
                      message: error instanceof Error ? error.message : "Unknown error",
                    });
                  }
                }}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
