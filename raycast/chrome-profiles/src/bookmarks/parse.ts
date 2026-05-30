import { BookmarkItem, BookmarkFolder } from "./types";

export function parseBookmarks(node: any): (BookmarkFolder | BookmarkItem)[] {
  if (!node.children) return [];
  return node.children.map((child: any) => {
    if (child.type === "url") {
      return { name: child.name, url: child.url } as BookmarkItem;
    }
    return { name: child.name, children: parseBookmarks(child) } as BookmarkFolder;
  });
}

export function collectUrls(folder: BookmarkFolder): string[] {
  const urls: string[] = [];
  for (const child of folder.children) {
    if ("url" in child) {
      urls.push(child.url);
    } else {
      urls.push(...collectUrls(child));
    }
  }
  return urls;
}
