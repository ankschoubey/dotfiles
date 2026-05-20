import { List, Icon, showToast, Toast, Action, ActionPanel, confirmAlert } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface QuitTarget {
  name: string;
  description: string;
  icon: Icon;
  action: () => Promise<void>;
  section: "system" | "dev" | "workspace" | "nuclear";
  dangerous?: boolean;
}

async function quitAerospace() {
  await execAsync(`osascript -e 'quit app "Aerospace"'`);
  await execAsync(`brew services stop sketchybar`);
  await execAsync(`brew services stop borders`);
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
    name: "AeroSpace",
    description: "Quit AeroSpace, SketchyBar, and Borders",
    icon: Icon.Window,
    action: quitAerospace,
    section: "system",
    dangerous: true,
  },
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
    name: "Everything",
    description: "Quit AeroSpace, Docker, Tmux, and Workspace Apps",
    icon: Icon.Power,
    action: async () => {
      await quitAerospace();
      await quitDocker();
      await quitTmux();
      await quitWorkspaceApps();
    },
    section: "nuclear",
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

export default function Command() {
  const sections = [
    { title: "System", targets: targets.filter((t) => t.section === "system") },
    { title: "Development", targets: targets.filter((t) => t.section === "dev") },
    { title: "Workspace", targets: targets.filter((t) => t.section === "workspace") },
    { title: "Nuclear", targets: targets.filter((t) => t.section === "nuclear") },
  ];

  return (
    <List
      searchBarPlaceholder="Search services to quit..."
      navigationTitle="System Quit"
    >
      {sections.map((section) => (
        <List.Section key={section.title} title={section.title}>
          {section.targets.map((target) => (
            <List.Item
              key={target.name}
              title={target.name}
              subtitle={target.description}
              icon={target.icon}
              accessories={
                target.dangerous
                  ? [{ tag: { value: "Destructive", color: "red" } }]
                  : []
              }
              actions={<TargetActions target={target} />}
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
