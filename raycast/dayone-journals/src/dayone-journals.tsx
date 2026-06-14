import { List, Action, ActionPanel, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { Journal, JournalGroup } from "./journals/types";
import { readJournals } from "./journals/storage";
import { groupJournals, getUngrouped } from "./journals/hierarchy";
import { createEntry } from "./entry/create";

function ParentGroupView({ group }: { group: JournalGroup }) {
  const items = [group.parent, ...group.children];
  return (
    <List searchBarPlaceholder={`Search in ${group.parent.name}...`}>
      {items.map((journal) => (
        <List.Item
          key={journal.id}
          title={journal.name}
          actions={
            <ActionPanel>
              <Action
                title="New Entry"
                icon={Icon.Plus}
                onAction={() => createEntry(journal.name)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export default function Command() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [groups, setGroups] = useState<JournalGroup[]>([]);
  const [ungrouped, setUngrouped] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const allJournals = readJournals();
      setJournals(allJournals);
      setGroups(groupJournals(allJournals));
      setUngrouped(getUngrouped(allJournals));
    } catch (error) {
      console.error("Failed to read journals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <List
      searchBarPlaceholder="Search journals..."
      navigationTitle="Day One Journals"
      isLoading={loading}
    >
      {ungrouped.map((journal) => (
        <List.Item
          key={journal.id}
          title={journal.name}
          actions={
            <ActionPanel>
              <Action
                title="New Entry"
                icon={Icon.Plus}
                onAction={() => createEntry(journal.name)}
              />
            </ActionPanel>
          }
        />
      ))}
      {groups.map((group) => (
        <List.Item
          key={group.parent.id}
          title={group.parent.name}
          accessories={[
            { tag: { value: `${group.children.length}`, color: "green" } },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Open Category"
                icon={Icon.ChevronRight}
                target={<ParentGroupView group={group} />}
              />
              <Action
                title="New Entry"
                icon={Icon.Plus}
                onAction={() => createEntry(group.parent.name)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
