import { List, Icon, showToast, Toast, Action, ActionPanel } from "@raycast/api";
import { useState, useEffect } from "react";
import { runBrewCommand } from "./shell";

interface DockerContainer {
  id: string;
  image: string;
  names: string;
  status: string;
}

async function stopDocker() {
  await runBrewCommand("colima", "stop 2>/dev/null || true");
  await runBrewCommand("osascript", "-e 'tell application \"Docker\" to quit' 2>/dev/null || true");
}

export function DockerContainerList() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [currentContext, setCurrentContext] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runBrewCommand("docker", "context inspect --format '{{.Name}}' 2>/dev/null")
      .then((r) => setCurrentContext(r.stdout.trim() || "default"))
      .catch(() => setCurrentContext("default"));

    runBrewCommand("docker", "ps --format '{{.ID}}|{{.Image}}|{{.Names}}|{{.Status}}' 2>/dev/null")
      .then((r) => {
        const items = r.stdout.trim().split("\n").filter(Boolean).map((line) => {
          const [id, image, names, status] = line.split("|");
          return { id, image, names, status };
        });
        setContainers(items);
      })
      .catch(() => setContainers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <List
      searchBarPlaceholder="Search containers..."
      navigationTitle="Docker Containers"
      isLoading={loading}
    >
      <List.Section title="Quick Actions">
        <List.Item
          title="Stop Docker"
          subtitle={`Context: ${currentContext}`}
          icon={Icon.Power}
          actions={
            <ActionPanel>
              <Action
                title="Stop Colima & Quit Docker Desktop"
                icon={Icon.Power}
                onAction={async () => {
                  await showToast({ style: Toast.Style.Animated, title: "Stopping Docker..." });
                  try {
                    await stopDocker();
                    await showToast({ style: Toast.Style.Success, title: "Docker stopped" });
                  } catch (error) {
                    await showToast({
                      style: Toast.Style.Failure,
                      title: "Failed to stop Docker",
                      message: error instanceof Error ? error.message : "Unknown error",
                    });
                  }
                }}
                shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Running Containers">
        {containers.map((c) => (
          <List.Item
            key={c.id}
            title={c.names}
            subtitle={c.image}
            accessories={[{ tag: { value: c.status, color: "green" } }]}
            actions={
              <ActionPanel>
                <Action
                  title="Kill Container"
                  icon={Icon.Power}
                  onAction={async () => {
                    await showToast({ style: Toast.Style.Animated, title: `Killing ${c.names}...` });
                    try {
                      await runBrewCommand("docker", `kill ${c.id} 2>/dev/null`);
                      setContainers((prev) => prev.filter((x) => x.id !== c.id));
                      await showToast({ style: Toast.Style.Success, title: `Killed ${c.names}` });
                    } catch (error) {
                      await showToast({
                        style: Toast.Style.Failure,
                        title: `Failed to kill ${c.names}`,
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
      </List.Section>
    </List>
  );
}
