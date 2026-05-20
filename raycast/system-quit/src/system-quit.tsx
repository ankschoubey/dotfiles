import { List, Icon, showToast, Toast, Action, ActionPanel, confirmAlert, Form, open } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { useState, useEffect } from "react";

const execAsync = promisify(exec);

interface QuitTarget {
  name: string;
  description: string;
  icon: Icon;
  action: () => Promise<void>;
  section: "system" | "dev" | "workspace" | "nuclear";
  dangerous?: boolean;
}

async function quitDocker() {
  await execAsync(`colima stop 2>/dev/null || true`);
  await execAsync(`osascript -e 'tell application "Docker" to quit' 2>/dev/null || true`);
}

async function quitTmux() {
  await execAsync(`tmux kill-server`);
}

async function quitWorkspaceApps() {
  const { stdout: currentWs } = await execAsync(`aerospace list-workspaces --focused`);
  const ws = currentWs.trim();

  const { stdout: windowsJson } = await execAsync(
    `aerospace list-windows --workspace "${ws}" --json`
  );

  const windows = JSON.parse(windowsJson);

  for (const w of windows) {
    const wid = w["window-id"];
    const app = w["app-name"];

    await execAsync(`aerospace focus --window-id ${wid}`);

    const { stdout: windowCount } = await execAsync(
      `osascript -e 'tell application "System Events" to set frontApp to first application process whose frontmost is true' -e 'return count of windows of frontApp'`
    );

    const count = parseInt(windowCount.trim(), 10);

    if (count === 1) {
      await execAsync(`osascript -e 'tell application "${app}" to quit'`);
    } else {
      await execAsync(`aerospace close`);
    }
  }
}

const targets: QuitTarget[] = [
  {
    name: "Docker",
    description: "Stop Colima and quit Docker",
    icon: Icon.Docker,
    action: quitDocker,
    section: "dev",
  },
  {
    name: "Tmux Sessions",
    description: "Kill all tmux sessions",
    icon: Icon.Terminal,
    action: quitTmux,
    section: "dev",
  },
  {
    name: "Workspace Apps",
    description: "Quit all apps in current workspace",
    icon: Icon.AppWindow,
    action: quitWorkspaceApps,
    section: "workspace",
  },
  {
    name: "Shutdown",
    description: "Run shutdown shortcut",
    icon: Icon.Power,
    action: async () => {
      await execAsync(`shortcuts run "Shutdown"`);
    },
    section: "system",
    dangerous: true,
  },
];

async function confirmAndQuit(target: QuitTarget) {
  if (target.dangerous) {
    const confirmed = await confirmAlert({
      title: `Quit ${target.name}?`,
      message: target.description,
      icon: Icon.Warning,
      primaryAction: { title: "Quit", style: "destructive" },
      dismissAction: { title: "Cancel" },
    });

    if (!confirmed) return;
  }

  await showToast({
    style: Toast.Style.Animated,
    title: `Quitting ${target.name}...`,
  });

  try {
    await target.action();
    await showToast({
      style: Toast.Style.Success,
      title: `Quit ${target.name}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: `Failed to quit ${target.name}`,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function TargetActions({ target }: { target: QuitTarget }) {
  return (
    <ActionPanel>
      <Action
        title={target.dangerous ? "Confirm & Quit" : "Quit"}
        icon={Icon.Power}
        onAction={() => confirmAndQuit(target)}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
        style={target.dangerous ? "destructive" : undefined}
      />
    </ActionPanel>
  );
}

function KillPortInput() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Kill Process"
            onSubmit={async (values: { port: string }) => {
              if (!values.port) {
                await showToast({ style: Toast.Style.Failure, title: "Port required" });
                return;
              }
              const encodedPort = encodeURIComponent(JSON.stringify({ port: values.port }));
              await showToast({ style: Toast.Style.Animated, title: "Opening Port Manager..." });
              await open(`raycast://extensions/lucaschultz/port-manager/kill-listening-process?arguments=${encodedPort}`);
            }}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="port"
        title="Port"
        placeholder="Enter port number (e.g. 3000)"
      />
    </Form>
  );
}

export default function Command() {
  const [currentWs, setCurrentWs] = useState("");
  const [wsAppCount, setWsAppCount] = useState(0);

  useEffect(() => {
    execAsync("aerospace list-workspaces --focused")
      .then((r) => {
        const ws = r.stdout.trim();
        setCurrentWs(ws);
        return execAsync(`aerospace list-windows --workspace "${ws}" --json`);
      })
      .then((r) => {
        const windows = JSON.parse(r.stdout);
        setWsAppCount(windows.length);
      })
      .catch(() => {
        setCurrentWs("");
        setWsAppCount(0);
      });
  }, []);

  const sections = [
    { title: "Workspace", targets: targets.filter((t) => t.section === "workspace") },
    { title: "Process", targets: [] },
    { title: "Development", targets: targets.filter((t) => t.section === "dev") },
    { title: "System", targets: targets.filter((t) => t.section === "system") },
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
              title={`Workspace ${wsAppCount} Apps`}
              accessories={[]}
              actions={<TargetActions target={targets.find((t) => t.name === "Workspace Apps")!} />}
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
                title="Listening Process"
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="Enter Port"
                      target={<KillPortInput />}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                    />
                  </ActionPanel>
                }
              />
            </>
          )}
          {section.targets.map((target) => (
            <List.Item
              key={target.name}
              title={target.name}
              accessories={[]}
              actions={<TargetActions target={target} />}
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
