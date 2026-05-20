import { List, Icon, showToast, Toast, Action, ActionPanel, useExec } from "@raycast/api";
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

async function fetchWorkspaces(): Promise<WorkspaceInfo[]> {
  const { stdout: wsList } = await execAsync(
    `aerospace list-workspaces --all --format '%{name}' --json`
  );

  const workspaces = JSON.parse(wsList) as { name: string }[];

  const { stdout: focusedWs } = await execAsync(
    `aerospace list-workspaces --focused --format '%{name}'`
  );

  const focused = focusedWs.trim();

  const result: WorkspaceInfo[] = [];

  for (const ws of workspaces) {
    try {
      const { stdout: windowsJson } = await execAsync(
        `aerospace list-windows --workspace "${ws.name}" --json`
      );

      const windows = JSON.parse(windowsJson) as any[];

      const windowInfos: WindowInfo[] = windows.map((w) => ({
        id: w["window-id"],
        name: w["title"] || w["app-name"],
        appName: w["app-name"],
        appId: w["app-id"] || "",
      }));

      result.push({
        name: ws.name,
        windows: windowInfos,
        isFocused: ws.name === focused,
      });
    } catch {
      result.push({ name: ws.name, windows: [], isFocused: ws.name === focused });
    }
  }

  return result;
}

async function focusWorkspace(wsName: string) {
  await showToast({
    style: Toast.Style.Animated,
    title: `Switching to Workspace ${wsName}...`,
  });

  try {
    await execAsync(`aerospace workspace "${wsName}"`);
    await showToast({
      style: Toast.Style.Success,
      title: `Workspace ${wsName}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to switch workspace",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function focusWindow(windowId: string, wsName: string) {
  await showToast({
    style: Toast.Style.Animated,
    title: `Focusing window...`,
  });

  try {
    await execAsync(`aerospace workspace "${wsName}"`);
    await execAsync(`aerospace focus --window-id "${windowId}"`);
    await showToast({
      style: Toast.Style.Success,
      title: "Window focused",
    });
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

  useEffect(() => {
    fetchWorkspaces()
      .then(setWorkspaces)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <List isLoading={true} />;
  }

  return (
    <List
      searchBarPlaceholder="Search workspaces and apps..."
      navigationTitle="Workspace Switcher"
    >
      {workspaces.map((ws) => (
        <List.Section
          key={ws.name}
          title={`Workspace ${ws.name}${ws.isFocused ? " (focused)" : ""}`}
          accessory={{
            icon: ws.isFocused ? Icon.Checkmark : Icon.Circle,
            tooltip: ws.isFocused ? "Currently focused" : `Workspace ${ws.name}`,
          }}
        >
          {ws.windows.length === 0 ? (
            <List.Item
              key={`${ws.name}-empty`}
              title="(empty)"
              icon={Icon.Minus}
              actions={<WorkspaceActions ws={ws} />}
            />
          ) : (
            ws.windows.map((win) => (
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
            ))
          )}
        </List.Section>
      ))}
    </List>
  );
}
