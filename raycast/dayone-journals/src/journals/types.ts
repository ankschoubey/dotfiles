export interface Journal {
  id: number;
  name: string;
  sortOrder: number;
}

export interface JournalGroup {
  parent: Journal;
  children: Journal[];
}
