import { showToast, Toast } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { ChromeConfig } from "./config";

const execAsync = promisify(exec);

export async function openChrome(config: ChromeConfig, profileDir: string, profileName: string) {
  try {
    await showToast({
      style: Toast.Style.Animated,
      title: `Opening ${profileName}...`,
    });

    await execAsync(
      `open -n -a "${config.bundleName}" --args --profile-directory="${profileDir}"`,
    );

    await showToast({
      style: Toast.Style.Success,
      title: `Launched ${profileName}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to launch Chrome",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function openUrlsInProfile(config: ChromeConfig, urls: string[], profileDir: string) {
  try {
    const urlArgs = urls.map((u) => `"${u}"`).join(" ");
    await execAsync(
      `nohup "${config.chromePath}" --profile-directory="${profileDir}" ${urlArgs} > /dev/null 2>&1 &`,
    );
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to open URLs in profile",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
