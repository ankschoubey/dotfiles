import {
  List,
  Icon,
  showToast,
  Toast,
  Action,
  ActionPanel,
  Color,
} from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { useEffect, useState } from "react";

const execAsync = promisify(exec);
const AEROSPACE = "/opt/homebrew/bin/aerospace";

const MAIN_WS = ["1", "2", "3", "4"];
const SECONDARY_WS = ["5", "6", "7", "8", "9"];

interface AppInfo {
  name: string;
  bundleId: string;
  path: string;
  isRunning: boolean;
}

interface WorkspaceDetail {
  name: string;
  appNames: string[];
}

async function fetchAllApps(): Promise<AppInfo[]> {
  const { stdout } = await execAsync(
    `for dir in /Applications $HOME/Applications /System/Applications /System/Applications/Utilities; do
      [ -d "$dir" ] && ls "$dir" 2>/dev/null | grep '\\.app$' | while read app; do
        path="$dir/$app"
        name=$(basename "$app" .app)
        bundle=$(mdls -raw -name kMDItemCFBundleIdentifier "$path" 2>/dev/null)
        [ -z "$bundle" ] && bundle="$path"
        echo "$name|$bundle|$path"
      done
    done`,
  );
  const seen = new Set<string>();
  const apps: AppInfo[] = [];
  for (const line of stdout.trim().split("\n")) {
    if (!line.trim()) continue;
    const [name, bundleId, path] = line.split("|");
    if (!name || seen.has(name)) continue;
    seen.add(name);
    apps.push({ name, bundleId: bundleId || path, path, isRunning: false });
  }
  apps.sort((a, b) => a.name.localeCompare(b.name));
  return apps;
}

async function fetchRunningBundleIds(): Promise<Set<string>> {
  try {
    const { stdout } = await execAsync(`${AEROSPACE} list-apps --json`);
    const apps = JSON.parse(stdout) as { "app-bundle-id": string }[];
    return new Set(apps.map((a) => a["app-bundle-id"]));
  } catch {
    return new Set();
  }
}

async function openApp(path: string) {
  await execAsync(`open "${path}"`);
  await showToast({ style: Toast.Style.Success, title: "App opened" });
}

async function openAppInWorkspace(path: string, ws: string) {
  await execAsync(`${AEROSPACE} workspace "${ws}"`);
  await execAsync(`open "${path}"`);
  await showToast({
    style: Toast.Style.Success,
    title: `App opened in workspace ${ws}`,
  });
}

async function fetchWorkspaceDetails(): Promise<WorkspaceDetail[]> {
  const { stdout: wsList } = await execAsync(
    `${AEROSPACE} list-workspaces --all --json`,
  );
  const workspaces = JSON.parse(wsList) as { workspace: string }[];
  const result: WorkspaceDetail[] = [];
  for (const ws of workspaces) {
    const name = ws.workspace;
    if (!/^\d+$/.test(name)) continue;
    try {
      const { stdout: windowsJson } = await execAsync(
        `${AEROSPACE} list-windows --workspace "${name}" --json`,
      );
      const windows = JSON.parse(windowsJson) as {
        "app-name": string;
      }[];
      result.push({
        name,
        appNames: windows.map((w) => w["app-name"]),
      });
    } catch {
      result.push({ name, appNames: [] });
    }
  }
  return result;
}

function AppList({
  apps,
  onOpen,
  onOpenInWorkspace,
  isLoading,
  searchText,
  onSearchTextChange,
}: {
  apps: AppInfo[];
  onOpen: (app: AppInfo) => void;
  onOpenInWorkspace: (app: AppInfo) => void;
  isLoading: boolean;
  searchText: string;
  onSearchTextChange: (text: string) => void;
}) {
  return (
    <List
      searchBarPlaceholder="Search apps..."
      navigationTitle="App Launcher"
      isLoading={isLoading}
      onSearchTextChange={onSearchTextChange}
    >
      {apps.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No apps found"
          description="Make sure the app directories exist"
        />
      ) : (
        apps.map((app) => (
          <List.Item
            key={app.bundleId}
            title={app.name}
            icon={
              app.bundleId.startsWith("/")
                ? { fileIcon: app.bundleId }
                : { appIcon: app.bundleId }
            }
            accessories={
              app.isRunning
                ? [{ tag: { value: "running", color: Color.Green } }]
                : []
            }
            actions={
              <ActionPanel>
                <Action
                  title="Open in Current Workspace"
                  icon={Icon.Window}
                  onAction={() => onOpen(app)}
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                />
                <Action
                  title="Open in Workspace..."
                  icon={Icon.Switch}
                  onAction={() => onOpenInWorkspace(app)}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

function WorkspacePicker({
  app,
  onBack,
}: {
  app: AppInfo;
  onBack: () => void;
}) {
  const [workspaces, setWorkspaces] = useState<WorkspaceDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaceDetails()
      .then(setWorkspaces)
      .catch(() =>
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to load workspaces",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const mainWs = workspaces.filter((w) => MAIN_WS.includes(w.name));
  const secondaryWs = workspaces.filter((w) => SECONDARY_WS.includes(w.name));

  return (
    <List
      searchBarPlaceholder="Select workspace..."
      navigationTitle={`Open ${app.name} in...`}
      isLoading={loading}
    >
      <List.Section
        title="Main Monitor (1-4)"
        subtitle="Built-in Retina Display"
      >
        {mainWs.map((ws) => (
          <List.Item
            key={ws.name}
            title={`Workspace ${ws.name}`}
            icon={Icon.Desktop}
            accessories={
              ws.appNames.length > 0
                ? [{ text: ws.appNames.join(", ") }]
                : [{ text: "empty" }]
            }
            actions={
              <ActionPanel>
                <Action
                  title={`Open in Workspace ${ws.name}`}
                  icon={Icon.ArrowRight}
                  onAction={async () => {
                    await openAppInWorkspace(app.path, ws.name);
                    onBack();
                  }}
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      <List.Section title="Secondary Monitor (5-9)" subtitle="LG Smart WQHD">
        {secondaryWs.map((ws) => (
          <List.Item
            key={ws.name}
            title={`Workspace ${ws.name}`}
            icon={Icon.Desktop}
            accessories={
              ws.appNames.length > 0
                ? [{ text: ws.appNames.join(", ") }]
                : [{ text: "empty" }]
            }
            actions={
              <ActionPanel>
                <Action
                  title={`Open in Workspace ${ws.name}`}
                  icon={Icon.ArrowRight}
                  onAction={async () => {
                    await openAppInWorkspace(app.path, ws.name);
                    onBack();
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

export default function Command() {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [showWorkspacePicker, setShowWorkspacePicker] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [allApps, runningIds] = await Promise.all([
          fetchAllApps(),
          fetchRunningBundleIds(),
        ]);
        setApps(
          allApps.map((a) => ({
            ...a,
            isRunning: runningIds.has(a.bundleId),
          })),
        );
      } catch (err) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to load apps",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (showWorkspacePicker && selectedApp) {
    return (
      <WorkspacePicker
        app={selectedApp}
        onBack={() => {
          setShowWorkspacePicker(false);
          setSelectedApp(null);
        }}
      />
    );
  }

  return (
    <AppList
      apps={apps.filter(
        (a) =>
          a.name.toLowerCase().includes(searchText.toLowerCase()) ||
          a.bundleId.toLowerCase().includes(searchText.toLowerCase()),
      )}
      onOpen={async (app) => {
        try {
          await openApp(app.path);
        } catch (err) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Failed to open app",
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }}
      onOpenInWorkspace={(app) => {
        setSelectedApp(app);
        setShowWorkspacePicker(true);
      }}
      isLoading={loading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
    />
  );
}
