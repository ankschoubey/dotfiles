import { List, Icon, showToast, Toast, Action, ActionPanel, confirmAlert, Form, open } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { useState, useEffect } from "react";

const execAsync = promisify(exec);

async function quitDocker() {
  await execAsync(`colima stop 2>/dev/null || true`);
  await execAsync(`osascript -e 'tell application "Docker" to quit' 2>/dev/null || true`);
}

async function quitTmux() {
  await execAsync(`tmux kill-server`);
}

async function quitWorkspaceApps() {
  const scriptPath = process.env.HOME + "/Documents/Github/dotfiles-1/raycast/scripts/quit-workspace-apps.sh";
  await execAsync(`PATH="/opt/homebrew/bin:$PATH" bash "${scriptPath}"`);
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
  const [wsAppNames, setWsAppNames] = useState("");

  useEffect(() => {
    execAsync("/opt/homebrew/bin/aerospace list-workspaces --focused")
      .then((r) => {
        const ws = r.stdout.trim();
        setCurrentWs(ws);
        return execAsync(`/opt/homebrew/bin/aerospace list-windows --workspace "${ws}" --json`);
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
  }, []);

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
                    onAction={async () => {
                      await showToast({ style: Toast.Style.Animated, title: "Quitting apps..." });
                      try {
                        await quitWorkspaceApps();
                        await showToast({ style: Toast.Style.Success, title: "Quit apps" });
                      } catch (error) {
                        await showToast({
                          style: Toast.Style.Failure,
                          title: "Failed to quit apps",
                          message: error instanceof Error ? error.message : "Unknown error",
                        });
                      }
                    }}
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
