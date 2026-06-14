import { showToast, Toast, confirmAlert, Icon } from "@raycast/api";
import { QuitTarget } from "./quit-target";

export async function runQuit(name: string, action: () => Promise<void>, dangerous?: boolean) {
  if (dangerous) {
    const confirmed = await confirmAlert({
      title: `Quit ${name}?`,
      icon: Icon.Warning,
      primaryAction: { title: "Quit", style: "destructive" },
      dismissAction: { title: "Cancel" },
    });
    if (!confirmed) return;
  }

  await showToast({ style: Toast.Style.Animated, title: `Quitting ${name}...` });

  try {
    await action();
    await showToast({ style: Toast.Style.Success, title: `Quit ${name}` });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: `Failed to quit ${name}`,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function confirmAndQuit(target: QuitTarget) {
  await runQuit(target.name, target.action!, target.dangerous);
}
