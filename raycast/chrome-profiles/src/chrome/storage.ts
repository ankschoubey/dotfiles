import fs from "fs";
import { ChromeConfig, getLocalStatePath, getProfileBookmarksPath } from "./config";
import { parseBookmarks } from "../bookmarks/parse";
import { BookmarkFolder, BookmarkItem } from "../bookmarks/types";

export interface ChromeStorage {
  getProfileDir(profileName: string): string | null;
  readBookmarks(profileDir: string): (BookmarkFolder | BookmarkItem)[];
}

export class RealChromeStorage implements ChromeStorage {
  constructor(private config: ChromeConfig) {}

  getProfileDir(profileName: string): string | null {
    try {
      const statePath = getLocalStatePath(this.config);
      const data = JSON.parse(fs.readFileSync(statePath, "utf8"));
      for (const [key, val] of Object.entries<any>(data.profile.info_cache)) {
        if (val.name === profileName) {
          return key;
        }
      }
    } catch {
      // file not found or parse error
    }
    return null;
  }

  readBookmarks(profileDir: string): (BookmarkFolder | BookmarkItem)[] {
    const bookmarksPath = getProfileBookmarksPath(this.config, profileDir);
    const data = JSON.parse(fs.readFileSync(bookmarksPath, "utf8"));
    const roots = data.roots;
    const result: (BookmarkFolder | BookmarkItem)[] = [];

    for (const key of Object.keys(roots)) {
      const root = roots[key];
      if (root.children && root.children.length > 0) {
        result.push(...parseBookmarks(root));
      }
    }

    return result;
  }
}
