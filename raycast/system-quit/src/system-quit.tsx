import { List, Icon, showToast, Toast, Action, ActionPanel } from "@raycast/api";
import { useState, useEffect } from "react";
import { runAerospace, runBrewCommand, runScript } from "./shell";
import { confirmAndQuit, runQuit } from "./quit-runner";
import { targets } from "./targets";
import { ListeningPortList } from "./listening-ports";

export default function Command() {
  const [currentWs, setCurrentWs] = useState("");
  const [wsAppCount, setWsAppCount] = useState(0);
  const [wsAppNames, setWsAppNames] = useState("");
  const [dockerCount, setDockerCount] = useState(0);
  const [tmuxCount, setTmuxCount] = useState(0);

  useEffect(() => {
    runAerospace("list-workspaces --focused")
      .then((r) => {
        const ws = r.stdout.trim();
        setCurrentWs(ws);
        return runAerospace(`list-windows --workspace "${ws}" --json`);
      })
      .then((r) => {
        const windows = JSON.parse(r.stdout);
        setWsAppCount(windows.length);
        setWsAppNames(windows.map((w: any) => w["app-name"]).join(", "));
      })
      .catch(() => {
        setCurrentWs("");
        setWsAppCount(0);
        setWsAppNames("");
      });

    runBrewCommand("docker", "ps --format '{{.ID}}' 2>/dev/null | wc -l")
      .then((r) => setDockerCount(parseInt(r.stdout.trim(), 10) || 0))
      .catch(() => setDockerCount(0));

    runBrewCommand("tmux", "list-sessions -F '#{session_name}' 2>/dev/null")
      .then((r) => setTmuxCount(r.stdout.trim().split("\n").filter(Boolean).length))
      .catch(() => setTmuxCount(0));
  }, []);

  const counts: Record<string, number> = {
    Docker: dockerCount,
    "Tmux Sessions": tmuxCount,
  };

  const sections = [
    { title: "Workspace", targets: [] },
    { title: "Process", targets: [] },
    { title: "Development", targets: targets.filter((t) => t.section === "dev") },
  ];

  return (
    <List
      searchBarPlaceholder="Search services to quit..."
      navigationTitle="System Quit"
    >
      {sections.map((section) => (
        <List.Section key={section.title} title={section.title}>
          {section.title === "Workspace" && currentWs && (
            <List.Item
              key="workspace-apps"
              title={`Workspace ${currentWs}`}
              subtitle={wsAppNames}
              accessories={[
                { tag: { value: `${wsAppCount}`, color: "primaryText" } },
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="Quit"
                    icon={Icon.Power}
                    onAction={() =>
                      runQuit("Workspace Apps", () => runScript("quit-workspace-apps.sh"))
                    }
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                </ActionPanel>
              }
            />
          )}
          {section.title === "Process" && (
            <>
              <List.Item
                title="Process"
                actions={
                  <ActionPanel>
                    <Action.Open
                      title="Open Process"
                      target="raycast://extensions/rolandleth/kill-process/index"
                      shortcut={{ modifiers: [], key: "enter" }}
                    />
                  </ActionPanel>
                }
              />
              <List.Item
                title="Listening Ports"
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="View Listening Ports"
                      target={<ListeningPortList />}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                    />
                  </ActionPanel>
                }
              />
            </>
          )}
          {section.targets.map((target) =>
            target.submenu ? (
              <List.Item
                key={target.name}
                title={target.name}
                icon={target.icon}
                accessories={[
                  { tag: { value: `${counts[target.name] ?? ""}`, color: "primaryText" } },
                ]}
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="View Sessions"
                      icon={target.icon}
                      target={<target.submenu />}
                      shortcut={{ modifiers: ["cmd"], key: "enter" }}
                    />
                  </ActionPanel>
                }
              />
            ) : (
              <List.Item
                key={target.name}
                title={target.name}
                icon={target.icon}
                accessories={[
                  { tag: { value: `${counts[target.name] ?? ""}`, color: "primaryText" } },
                ]}
                actions={
                  <ActionPanel>
                    <Action
                      title={target.dangerous ? "Confirm & Quit" : "Quit"}
                      icon={Icon.Power}
                      onAction={() => confirmAndQuit(target)}
                      shortcut={{ modifiers: ["cmd"], key: "enter" }}
                      style={target.dangerous ? "destructive" : undefined}
                    />
                  </ActionPanel>
                }
              />
            ),
          )}
        </List.Section>
      ))}
    </List>
  );
}
