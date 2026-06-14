import { Journal, JournalGroup } from "./types";

export function isParent(journal: Journal): boolean {
  return journal.name.startsWith("▶︎");
}

export function groupJournals(journals: Journal[]): JournalGroup[] {
  const groups: JournalGroup[] = [];
  let currentParent: Journal | null = null;
  let currentChildren: Journal[] = [];

  for (const journal of journals) {
    if (isParent(journal)) {
      if (currentParent) {
        groups.push({ parent: currentParent, children: currentChildren });
      }
      currentParent = journal;
      currentChildren = [];
    } else {
      currentChildren.push(journal);
    }
  }

  if (currentParent) {
    groups.push({ parent: currentParent, children: currentChildren });
  }

  return groups;
}

export function getUngrouped(journals: Journal[]): Journal[] {
  const firstParentIdx = journals.findIndex(isParent);
  return firstParentIdx > 0 ? journals.slice(0, firstParentIdx) : [];
}
