# @raycast/chrome-profiles

## Domain terms

**Chrome profile** — a named Chrome user profile (e.g. "Ankush", "Dev Flax"). Each profile maps to a directory name in Chrome's data dir via `Local State`.

**Chrome config** — paths and strategies for finding and launching Chrome (executable path, bundle name, data directory).

**Chrome storage** — reads Chrome's filesystem (Local State, Bookmarks) to resolve profiles and bookmark data. Interface hides file paths, JSON shapes, and error handling.

**Bookmark tree** — Chrome's bookmark data as a recursive structure of folders and items. Pure parse/flatten operations on this tree.

**Profile config** — user's profile definitions (names, icons, groupings, active/deprecated status).

**Launch** — opening a new Chrome window or opening URLs in a specific profile directory.
