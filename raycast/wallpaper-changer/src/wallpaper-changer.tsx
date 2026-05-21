import { List, Icon, showToast, Toast, Action, ActionPanel, getPreferenceValues } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { readdirSync } from "fs";
import { homedir } from "os";
import { join, extname } from "path";
import { useState, useEffect } from "react";

const execAsync = promisify(exec);

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".heic", ".heif", ".bmp", ".tiff", ".tif", ".webp"]);

interface Wallpaper {
  name: string;
  displayName: string;
  path: string;
  isCurrent: boolean;
}

function getWallpapersDir(): string {
  const prefs = getPreferenceValues<{ wallpaperDir?: string }>();
  return prefs.wallpaperDir || join(homedir(), "Documents", "Github", "dotfiles-1", "wallpaper");
}

function listWallpapers(): string[] {
  const dir = getWallpapersDir();
  try {
    return readdirSync(dir)
      .filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()))
      .sort();
  } catch {
    return [];
  }
}

async function getCurrentWallpaper(): Promise<string> {
  const { stdout } = await execAsync(
    `osascript -e 'tell application "System Events" to get picture of every desktop'`
  );
  return stdout.trim();
}

async function setWallpaper(path: string) {
  await execAsync(
    `osascript -e 'tell application "System Events" to tell every desktop to set picture to "${path}"'`
  );
}

export default function Command() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const dir = getWallpapersDir();
      const files = listWallpapers();
      let current = "";
      try {
        current = await getCurrentWallpaper();
      } catch {
        // ignore
      }

      setWallpapers(
        files.map((f) => ({
          name: f,
          displayName: f.replace(extname(f), ""),
          path: join(dir, f),
          isCurrent: current.includes(f),
        }))
      );
      setLoading(false);
    })();
  }, []);

  return (
    <List isLoading={loading} searchBarPlaceholder="Search wallpapers..." navigationTitle="Wallpaper Changer">
      {wallpapers.length === 0 && !loading && (
        <List.Item
          title="No wallpapers found"
          subtitle={`Add images to ${getWallpapersDir()}`}
          icon={Icon.Warning}
        />
      )}
      {wallpapers.map((wp) => (
        <List.Item
          key={wp.name}
          title={wp.displayName}
          icon={wp.isCurrent ? Icon.CheckCircle : { fileIcon: wp.path }}
          accessories={
            wp.isCurrent
              ? [{ tag: { value: "Current", color: "green" } }]
              : []
          }
          actions={
            <ActionPanel>
              {!wp.isCurrent && (
                <Action
                  title="Set Wallpaper"
                  icon={Icon.Image}
                  onAction={async () => {
                    await showToast({ style: Toast.Style.Animated, title: `Setting ${wp.displayName}...` });
                    try {
                      await setWallpaper(wp.path);
                      setWallpapers((prev) =>
                        prev.map((p) => ({ ...p, isCurrent: p.path === wp.path }))
                      );
                      await showToast({ style: Toast.Style.Success, title: `Set ${wp.displayName}` });
                    } catch (error) {
                      await showToast({
                        style: Toast.Style.Failure,
                        title: "Failed to set wallpaper",
                        message: error instanceof Error ? error.message : "Unknown error",
                      });
                    }
                  }}
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                />
              )}
              {wp.isCurrent && (
                <Action
                  title="Re-apply Current"
                  icon={Icon.ArrowClockwise}
                  onAction={async () => {
                    await showToast({ style: Toast.Style.Animated, title: `Re-applying ${wp.displayName}...` });
                    try {
                      await setWallpaper(wp.path);
                      await showToast({ style: Toast.Style.Success, title: `Re-applied ${wp.displayName}` });
                    } catch (error) {
                      await showToast({
                        style: Toast.Style.Failure,
                        title: "Failed to set wallpaper",
                        message: error instanceof Error ? error.message : "Unknown error",
                      });
                    }
                  }}
                />
              )}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
