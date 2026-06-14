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

interface RunningApp {
  bundleId: string;
  appName: string;
  windowCount: number;
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

async function fetchAllManagedAppIds(): Promise<Set<string>> {
  const { stdout: wsList } = await execAsync(
    `${AEROSPACE} list-workspaces --all --json`
  );
  const workspaces = JSON.parse(wsList) as { workspace: string }[];
  const appIds = new Set<string>();

  for (const ws of workspaces) {
    try {
      const { stdout: windowsJson } = await execAsync(
        `${AEROSPACE} list-windows --workspace "${ws.workspace}" --json`
      );
      const windows = JSON.parse(windowsJson) as any[];
      for (const w of windows) {
        if (w["app-id"]) {
          appIds.add(w["app-id"]);
        }
      }
    } catch (err) {
      console.error(`Error fetching windows for workspace ${ws.workspace}:`, err);
    }
  }

  return appIds;
}

async function fetchRunningApps(): Promise<RunningApp[]> {
  const script = `tell application "System Events"
    set runningProcs to every process whose background only is false
    set output to ""
    repeat with proc in runningProcs
      try
        set bundleID to bundle identifier of proc
        set procName to name of proc
        set winCount to count of windows of proc
        if winCount > 0 then
          set output to output & bundleID & "|||" & procName & "|||" & winCount & linefeed
        end if
      end try
    end repeat
    return output
  end tell`;

  const { stdout } = await execAsync(`osascript -e '${script}'`);
  const lines = stdout.trim().split("\n").filter(Boolean);

  return lines.map((line) => {
    const [bundleId, appName, winCount] = line.split("|||");
    return { bundleId, appName, windowCount: parseInt(winCount, 10) };
  });
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

async function focusApp(appName: string) {
  try {
    await execAsync(`open -a "${appName.replace(/"/g, '\\"')}"`);
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to focus app",
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

function AppActions({ app }: { app: RunningApp }) {
  return (
    <ActionPanel>
      <Action
        title="Focus App"
        icon={Icon.AppWindow}
        onAction={() => focusApp(app.appName)}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
      />
    </ActionPanel>
  );
}

export default function Command() {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [unassignedApps, setUnassignedApps] = useState<RunningApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    Promise.all([fetchWorkspaces(), fetchAllManagedAppIds(), fetchRunningApps()])
      .then(([wsData, managedIds, runningApps]) => {
        setWorkspaces(wsData);
        const unassigned = runningApps.filter(
          (app) => !managedIds.has(app.bundleId)
        );
        setUnassignedApps(unassigned);
        setError(null);
      })
      .catch((err) => {
        console.error("fetch error:", err);
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
          title="Error loading data"
          subtitle={error}
          icon={Icon.Warning}
        />
      </List>
    );
  }

  const hasUnassigned = unassignedApps.length > 0;

  const visibleWorkspaces = workspaces
    .map((ws) => ({
      ...ws,
      windows: ws.windows.filter(
        (win) =>
          win.appName.toLowerCase().includes(searchText.toLowerCase()) ||
          win.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    }))
    .filter((ws) => ws.windows.length > 0);

  const filteredUnassigned = unassignedApps.filter(
    (app) => app.appName.toLowerCase().includes(searchText.toLowerCase())
  );

  if (visibleWorkspaces.length === 0 && filteredUnassigned.length === 0) {
    return (
      <List>
        <List.Item
          title="No results found"
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
      onSearchTextChange={setSearchText}
      isShowingSearchBar={true}
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
              icon={win.appId ? { appIcon: win.appId } : Icon.AppWindow}
              accessories={[
                { tag: { value: `WS ${ws.name}`, color: ws.isFocused ? "green" : "secondaryText" } },
              ]}
              actions={<WindowActions window={win} wsName={ws.name} />}
            />
          ))}
        </List.Section>
      ))}
      {hasUnassigned && filteredUnassigned.length > 0 && (
        <List.Section
          title="Unassigned Apps"
          subtitle="Running apps not in any workspace"
        >
          {filteredUnassigned.map((app) => (
            <List.Item
              key={app.bundleId}
              title={app.appName}
              subtitle={`${app.windowCount} window${app.windowCount > 1 ? "s" : ""}`}
              icon={{ appIcon: app.bundleId }}
              accessories={[
                { tag: { value: "Unassigned", color: "orange" } },
              ]}
              actions={<AppActions app={app} />}
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
