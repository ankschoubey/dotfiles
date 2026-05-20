import { List, Icon, showToast, Toast, Action, ActionPanel } from "@raycast/api";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

interface Profile {
  name: string;
  icon: string;
}

const profiles: Profile[] = [
  { name: "Ankush", icon: "👨‍💻" },
  { name: "Business Ankush", icon: "💼" },
  { name: "Dev Flax", icon: "⚡" },
  { name: "Feel And Heal", icon: "🧠" },
  { name: "Prod Svaaya", icon: "🚀" },
  { name: "Your Chrome", icon: "🌐" },
];

function getProfileDir(profileName: string): string | null {
  const path = process.env.HOME + "/Library/Application Support/Google/Chrome/Local State";
  const data = JSON.parse(fs.readFileSync(path, "utf8"));

  for (const [key, val] of Object.entries<any>(data.profile.info_cache)) {
    if (val.name === profileName) {
      return key;
    }
  }

  return null;
}

async function openChrome(profile: string) {
  const dir = getProfileDir(profile);

  if (!dir) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Profile not found",
      message: `Could not find profile directory for "${profile}"`,
    });
    return;
  }

  await showToast({
    style: Toast.Style.Animated,
    title: `Opening ${profile}...`,
  });

  try {
    await execAsync(`open -n -a "Google Chrome" --args --profile-directory="${dir}"`);
    await showToast({
      style: Toast.Style.Success,
      title: `Launched ${profile}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to launch Chrome",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function ProfileActions({ profile }: { profile: Profile }) {
  return (
    <ActionPanel>
      <Action
        title="Launch Profile"
        icon={Icon.Globe}
        onAction={() => openChrome(profile.name)}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
      />
    </ActionPanel>
  );
}

export default function Command() {
  return (
    <List
      searchBarPlaceholder="Search Chrome profiles..."
      navigationTitle="Chrome Profiles"
    >
      {profiles.map((profile) => (
        <List.Item
          key={profile.name}
          title={profile.name}
          icon={profile.icon}
          actions={<ProfileActions profile={profile} />}
        />
      ))}
    </List>
  );
}
