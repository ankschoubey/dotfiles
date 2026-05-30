import path from "path";

export interface ChromeConfig {
  chromePath: string;
  bundleName: string;
  dataDir: string;
}

export const defaultChromeConfig: ChromeConfig = {
  chromePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  bundleName: "Google Chrome",
  dataDir: path.join(process.env.HOME!, "Library/Application Support/Google/Chrome"),
};

export function getLocalStatePath(config: ChromeConfig): string {
  return path.join(config.dataDir, "Local State");
}

export function getProfileBookmarksPath(config: ChromeConfig, profileDir: string): string {
  return path.join(config.dataDir, profileDir, "Bookmarks");
}
