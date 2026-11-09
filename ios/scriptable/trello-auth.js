// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Trello API Configuration
// Update your API key and token here

const TRELLO_API_KEY = "227178a5855a9ec7094654b0cff02711";
const TRELLO_API_TOKEN =
  "ATTA432fa0e4932ca8f376b3678a87ba3b80df975d59bd18496a4a1b3ed66f3c8ec9C8251908";
// api_key=227178a5855a9ec7094654b0cff02711
// api_secret=df10ed3cfb78cd68fa2b93777f01933dccbe2d3d45fd91cad1baf279e27d6851
// token=ATTA432fa0e4932ca8f376b3678a87ba3b80df975d59bd18496a4a1b3ed66f3c8ec9C8251908
// Board IDs to track - find them in the board URL
// e.g. https://trello.com/b/abc123/board-name → board ID is "abc123"
// To get board IDs: visit your board URL, the ID is in the URL path

// Workspace short names (from Trello URL: trello.com/u/juratempest → "juratempest")
const WORKSPACES = ["juratempest", "business02988268"];

module.exports = { TRELLO_API_KEY, TRELLO_API_TOKEN, WORKSPACES };
