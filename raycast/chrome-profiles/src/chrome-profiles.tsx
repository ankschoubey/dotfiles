import {
  List,
  Icon,
  Action,
  ActionPanel,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { defaultChromeConfig } from "./chrome/config";
import { RealChromeStorage } from "./chrome/storage";
import { openChrome, openUrlsInProfile } from "./chrome/launch";
import { getActiveSections, getDeprecatedProfiles } from "./profiles/config";
import { Profile } from "./profiles/types";
import { BookmarkFolder, BookmarkItem } from "./bookmarks/types";
import { collectUrls } from "./bookmarks/parse";

const chromeConfig = defaultChromeConfig;
const storage = new RealChromeStorage(chromeConfig);

function DeprecatedProfiles() {
  return (
    <List
      searchBarPlaceholder="Search deprecated profiles..."
      navigationTitle="Deprecated Profiles"
    >
      <List.Section
        title="Deprecated"
        accessory={{ icon: Icon.Archive, tooltip: "Deprecated" }}
      >
        {getDeprecatedProfiles().map((profile) => {
          const profileDir = storage.getProfileDir(profile.name);
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
                    target={
                      <ProfileBookmarks
                        profileName={profile.name}
                        profileDir={profileDir}
                      />
                    }
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

function BookmarkItemActions({ url, profileDir }: { url: string; profileDir: string }) {
  return (
    <ActionPanel>
      <Action
        title="Open Bookmark"
        icon={Icon.Globe}
        onAction={async () => {
          await openUrlsInProfile(chromeConfig, [url], profileDir);
        }}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
      />
    </ActionPanel>
  );
}

function BookmarkFolderView({
  folder,
  profileDir,
}: {
  folder: BookmarkFolder;
  profileDir: string;
}) {
  const folders = folder.children.filter(
    (c): c is BookmarkFolder => "children" in c,
  );
  const items = folder.children.filter((c): c is BookmarkItem => "url" in c);

  return (
    <List
      searchBarPlaceholder="Search bookmarks..."
      navigationTitle={folder.name}
    >
      {items.map((item) => (
        <List.Item
          key={`item-${item.url}`}
          title={item.name}
          icon={Icon.Globe}
          actions={<BookmarkItemActions url={item.url} profileDir={profileDir} />}
        />
      ))}
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
                target={
                  <BookmarkFolderView folder={f} profileDir={profileDir} />
                }
              />
              <Action
                title="Open All URLs in Folder"
                icon={Icon.Globe}
                onAction={async () => {
                  const urls = collectUrls(f);
                  await openUrlsInProfile(chromeConfig, urls, profileDir);
                }}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function ProfileBookmarks({
  profileName,
  profileDir,
}: {
  profileName: string;
  profileDir: string;
}) {
  const [bookmarks, setBookmarks] = useState<(BookmarkFolder | BookmarkItem)[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const allBookmarks = storage.readBookmarks(profileDir);
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
                onAction={() => openChrome(chromeConfig, profileDir, profileName)}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
      {items.length > 0 && (
        <List.Section title="Bookmarks">
          {items.map((item) => (
            <List.Item
              key={item.url}
              title={item.name}
              icon={Icon.Globe}
              actions={<BookmarkItemActions url={item.url} profileDir={profileDir} />}
            />
          ))}
        </List.Section>
      )}
      {folders.length > 0 && (
        <List.Section title="Folders">
          {folders.map((folder) => (
            <List.Item
              key={folder.name}
              title={folder.name}
              icon={Icon.Folder}
              accessories={[
                {
                  tag: {
                    value: `${folder.children.length}`,
                    color: "secondaryText",
                  },
                },
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Open Folder"
                    icon={Icon.Folder}
                    target={
                      <BookmarkFolderView
                        folder={folder}
                        profileDir={profileDir}
                      />
                    }
                  />
                  <Action
                    title="Open All URLs in Folder"
                    icon={Icon.Globe}
                    onAction={async () => {
                      const urls = collectUrls(folder);
                      await openUrlsInProfile(chromeConfig, urls, profileDir);
                    }}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function ProfileActions({ profile }: { profile: Profile }) {
  const profileDir = storage.getProfileDir(profile.name);

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
        target={
          <ProfileBookmarks
            profileName={profile.name}
            profileDir={profileDir}
          />
        }
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
      {getActiveSections().map((section) => (
        <List.Section
          key={section.title}
          title={section.title}
          accessory={section.accessory}
        >
          {section.profiles.map((profile) => (
            <List.Item
              key={profile.name}
              title={profile.name}
              icon={profile.icon}
              accessories={[{ tag: { value: "Active", color: "green" } }]}
              actions={<ProfileActions profile={profile} />}
            />
          ))}
        </List.Section>
      ))}
      <List.Section
        title=""
        accessory={{ icon: Icon.Archive, tooltip: "Deprecated" }}
      >
        <List.Item
          title="Others"
          icon={Icon.Archive}
          accessories={[
            {
              tag: {
                value: `${getDeprecatedProfiles().length}`,
                color: "secondaryText",
              },
            },
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
