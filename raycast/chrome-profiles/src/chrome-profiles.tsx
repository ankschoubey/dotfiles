import { List, Icon, showToast, Toast, Action, ActionPanel, open } from "@raycast/api";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { useState, useEffect } from "react";

const execAsync = promisify(exec);

interface BookmarkItem {
  name: string;
  url: string;
}

interface BookmarkFolder {
  name: string;
  children: (BookmarkFolder | BookmarkItem)[];
}

interface Profile {
  name: string;
  icon: Icon;
}

const activeSections: { title: string; accessory: List.Item.Accessory; profiles: Profile[] }[] = [
  {
    title: "Personal",
    accessory: { icon: Icon.Person, tooltip: "Personal" },
    profiles: [
      { name: "Ankush", icon: Icon.Person },
    ],
  },
  {
    title: "Gigs",
    accessory: { icon: Icon.Briefcase, tooltip: "Gigs" },
    profiles: [
      { name: "Dev Flax", icon: Icon.Code },
      { name: "Prod Svaaya", icon: Icon.Rocket },
    ],
  },
];

const deprecatedProfiles: Profile[] = [
  { name: "Business Ankush", icon: Icon.Archive },
  { name: "Feel And Heal", icon: Icon.Archive },
  { name: "Your Chrome", icon: Icon.Archive },
];

function DeprecatedProfiles() {
  return (
    <List
      searchBarPlaceholder="Search deprecated profiles..."
      navigationTitle="Deprecated Profiles"
    >
      <List.Section title="Deprecated" accessory={{ icon: Icon.Archive, tooltip: "Deprecated" }}>
        {deprecatedProfiles.map((profile) => {
          const profileDir = getProfileDir(profile.name);
          return profileDir ? (
            <List.Item
              key={profile.name}
              title={profile.name}
              icon={profile.icon}
              accessories={[
                { tag: { value: "Deprecated", color: "secondaryText" } },
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Open Profile"
                    icon={Icon.Globe}
                    target={<ProfileBookmarks profileName={profile.name} profileDir={profileDir} />}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                </ActionPanel>
              }
            />
          ) : null;
        })}
      </List.Section>
    </List>
  );
}

function getProfileDir(profileName: string): string | null {
  const statePath = process.env.HOME + "/Library/Application Support/Google/Chrome/Local State";
  const data = JSON.parse(fs.readFileSync(statePath, "utf8"));

  for (const [key, val] of Object.entries<any>(data.profile.info_cache)) {
    if (val.name === profileName) {
      return key;
    }
  }

  return null;
}

function getProfileBookmarksPath(profileDir: string): string {
  return path.join(
    process.env.HOME!,
    "Library/Application Support/Google/Chrome",
    profileDir,
    "Bookmarks"
  );
}

function parseBookmarks(node: any): (BookmarkFolder | BookmarkItem)[] {
  if (!node.children) return [];
  return node.children.map((child: any) => {
    if (child.type === "url") {
      return { name: child.name, url: child.url };
    }
    return { name: child.name, children: parseBookmarks(child) };
  });
}

function BookmarkItemActions({ url }: { url: string }) {
  return (
    <ActionPanel>
      <Action
        title="Open Bookmark"
        icon={Icon.Globe}
        onAction={async () => {
          await open(url);
        }}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
      />
    </ActionPanel>
  );
}

function BookmarkFolderView({ folder, profileDir }: { folder: BookmarkFolder; profileDir: string }) {
  const folders = folder.children.filter((c): c is BookmarkFolder => "children" in c);
  const items = folder.children.filter((c): c is BookmarkItem => "url" in c);

  return (
    <List
      searchBarPlaceholder="Search bookmarks..."
      navigationTitle={folder.name}
    >
      {folders.map((f) => (
        <List.Item
          key={`folder-${f.name}`}
          title={f.name}
          icon={Icon.Folder}
          accessories={[
            { tag: { value: `${f.children.length}`, color: "secondaryText" } },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Open Folder"
                icon={Icon.Folder}
                target={<BookmarkFolderView folder={f} profileDir={profileDir} />}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      ))}
      {items.map((item) => (
        <List.Item
          key={`item-${item.url}`}
          title={item.name}
          icon={Icon.Globe}
          actions={<BookmarkItemActions url={item.url} />}
        />
      ))}
    </List>
  );
}

function ProfileBookmarks({ profileName, profileDir }: { profileName: string; profileDir: string }) {
  const [bookmarks, setBookmarks] = useState<(BookmarkFolder | BookmarkItem)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookmarksPath = getProfileBookmarksPath(profileDir);
    try {
      const data = JSON.parse(fs.readFileSync(bookmarksPath, "utf8"));
      const roots = data.roots;
      const allBookmarks: (BookmarkFolder | BookmarkItem)[] = [];

      for (const key of Object.keys(roots)) {
        const root = roots[key];
        if (root.children && root.children.length > 0) {
          allBookmarks.push(...parseBookmarks(root));
        }
      }
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error("Failed to read bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }, [profileDir]);

  const folders = bookmarks.filter((b): b is BookmarkFolder => "children" in b);
  const items = bookmarks.filter((b): b is BookmarkItem => "url" in b);

  return (
    <List
      searchBarPlaceholder="Search bookmarks..."
      navigationTitle={`${profileName} Bookmarks`}
      isLoading={loading}
    >
      <List.Section title="Quick Actions">
        <List.Item
          title="New Window"
          icon={Icon.Plus}
          actions={
            <ActionPanel>
              <Action
                title="Open New Window"
                icon={Icon.Plus}
                onAction={() => openChrome(profileName)}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
      {folders.length > 0 && (
        <List.Section title="Folders">
          {folders.map((folder) => (
            <List.Item
              key={folder.name}
              title={folder.name}
              icon={Icon.Folder}
              accessories={[
                { tag: { value: `${folder.children.length}`, color: "secondaryText" } },
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Open Folder"
                    icon={Icon.Folder}
                    target={<BookmarkFolderView folder={folder} profileDir={profileDir} />}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
      {items.length > 0 && (
        <List.Section title="Bookmarks">
          {items.map((item) => (
            <List.Item
              key={item.url}
              title={item.name}
              icon={Icon.Globe}
              actions={<BookmarkItemActions url={item.url} />}
            />
          ))}
        </List.Section>
      )}
    </List>
  );
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
  const profileDir = getProfileDir(profile.name);

  if (!profileDir) {
    return (
      <ActionPanel>
        <Action
          title="Profile Not Found"
          icon={Icon.Warning}
          onAction={() => {}}
        />
      </ActionPanel>
    );
  }

  return (
    <ActionPanel>
      <Action.Push
        title="Open Profile"
        icon={Icon.Globe}
        target={<ProfileBookmarks profileName={profile.name} profileDir={profileDir} />}
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
      {activeSections.map((section) => (
        <List.Section key={section.title} title={section.title} accessory={section.accessory}>
          {section.profiles.map((profile) => (
            <List.Item
              key={profile.name}
              title={profile.name}
              icon={profile.icon}
              accessories={[
                { tag: { value: "Active", color: "green" } },
              ]}
              actions={<ProfileActions profile={profile} />}
            />
          ))}
        </List.Section>
      ))}
      <List.Section title="" accessory={{ icon: Icon.Archive, tooltip: "Deprecated" }}>
        <List.Item
          title="Others"
          icon={Icon.Archive}
          accessories={[
            { tag: { value: `${deprecatedProfiles.length}`, color: "secondaryText" } },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Open Deprecated Profiles"
                icon={Icon.Archive}
                target={<DeprecatedProfiles />}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
