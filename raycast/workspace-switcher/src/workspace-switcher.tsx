import { List, Icon, showToast, Toast, Action, ActionPanel } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { useEffect, useState } from "react";

const execAsync = promisify(exec);

interface WindowInfo {
  id: string;
  name: string;
  appName: string;
  appId: string;
}

interface WorkspaceInfo {
  name: string;
  windows: WindowInfo[];
  isFocused: boolean;
}

const AEROSPACE = "/opt/homebrew/bin/aerospace";

async function fetchWorkspaces(): Promise<WorkspaceInfo[]> {
  const { stdout: wsList } = await execAsync(
    `${AEROSPACE} list-workspaces --all --json`
  );

  const workspaces = JSON.parse(wsList) as { workspace: string }[];

  const { stdout: focusedWs } = await execAsync(
    `${AEROSPACE} list-workspaces --focused`
  );

  const focused = focusedWs.trim();

  const result: WorkspaceInfo[] = [];

  for (const ws of workspaces) {
    const wsName = ws.workspace;
    if (!/^\d+$/.test(wsName)) continue;

    try {
      const { stdout: windowsJson } = await execAsync(
        `${AEROSPACE} list-windows --workspace "${wsName}" --json`
      );

      const windows = JSON.parse(windowsJson) as any[];

      const windowInfos: WindowInfo[] = windows.map((w) => ({
        id: String(w["window-id"]),
        name: w["window-title"] || w["app-name"],
        appName: w["app-name"],
        appId: w["app-id"] || "",
      }));

      result.push({
        name: wsName,
        windows: windowInfos,
        isFocused: wsName === focused,
      });
    } catch (err) {
      console.error(`Error fetching workspace ${wsName}:`, err);
      result.push({ name: wsName, windows: [], isFocused: wsName === focused });
    }
  }

  return result;
}

async function focusWorkspace(wsName: string) {
  try {
    await execAsync(`${AEROSPACE} workspace "${wsName}"`);
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to switch workspace",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function focusWindow(windowId: string, wsName: string) {
  try {
    await execAsync(`${AEROSPACE} workspace "${wsName}"`);
    await execAsync(`${AEROSPACE} focus --window-id "${windowId}"`);
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to focus window",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function WorkspaceActions({ ws }: { ws: WorkspaceInfo }) {
  return (
    <ActionPanel>
      <Action
        title="Focus Workspace"
        icon={Icon.Window}
        onAction={() => focusWorkspace(ws.name)}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
      />
    </ActionPanel>
  );
}

function WindowActions({ window, wsName }: { window: WindowInfo; wsName: string }) {
  return (
    <ActionPanel>
      <Action
        title="Focus Window"
        icon={Icon.AppWindow}
        onAction={() => focusWindow(window.id, wsName)}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
      />
      <Action
        title="Focus Workspace"
        icon={Icon.Window}
        onAction={() => focusWorkspace(wsName)}
        shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
      />
    </ActionPanel>
  );
}

export default function Command() {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces()
      .then((data) => {
        setWorkspaces(data);
        setError(null);
      })
      .catch((err) => {
        console.error("fetchWorkspaces error:", err);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <List isLoading={true} />;
  }

  if (error) {
    return (
      <List>
        <List.Item
          title="Error loading workspaces"
          subtitle={error}
          icon={Icon.Warning}
        />
      </List>
    );
  }

  const visibleWorkspaces = workspaces.filter(
    (ws) => ws.windows.length > 0
  );

  if (visibleWorkspaces.length === 0) {
    return (
      <List>
        <List.Item
          title="No workspaces found"
          subtitle="Make sure AeroSpace is running"
          icon={Icon.Warning}
        />
      </List>
    );
  }

  return (
    <List
      searchBarPlaceholder="Search workspaces and apps..."
      navigationTitle="Workspace Switcher"
    >
      {visibleWorkspaces.map((ws) => (
        <List.Section
          key={ws.name}
          title={`Workspace ${ws.name}${ws.isFocused ? " (focused)" : ""}`}
          accessory={{
            icon: ws.isFocused ? Icon.Checkmark : Icon.Circle,
            tooltip: ws.isFocused ? "Currently focused" : `Workspace ${ws.name}`,
          }}
        >
          {ws.windows.map((win) => (
            <List.Item
              key={win.id}
              title={win.appName}
              subtitle={win.name !== win.appName ? win.name : undefined}
              icon={Icon.AppWindow}
              accessories={[
                { tag: { value: `WS ${ws.name}`, color: ws.isFocused ? "green" : "secondaryText" } },
              ]}
              actions={<WindowActions window={win} wsName={ws.name} />}
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
