export interface BookmarkItem {
  name: string;
  url: string;
}

export interface BookmarkFolder {
  name: string;
  children: (BookmarkFolder | BookmarkItem)[];
}
