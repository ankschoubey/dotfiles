#!/bin/bash

# import-to-dayone.sh
#
# Description:
#   Imports a locally downloaded Trello card into the Day One app.
#   It formats the card data into a journal entry, adds tags,
#   and attaches all downloaded files.
#
# Usage:
#   ./import-to-dayone.sh <CARD_ID>
#
# Dependencies:
#   - dayone2: The official Day One command-line tool (v2).
#   - jq: For parsing the local card.json file.

set -e
set -o pipefail
set -x # Enable tracing

# --- Validation ---
if ! command -v dayone2 &>/dev/null; then
  echo "Error: dayone2 is not installed or not in your PATH."
  echo "Please install it from: https://dayoneapp.com/guides/tips-and-tutorials/command-line-interface-cli/"
  exit 1
fi

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <CARD_ID>"
  exit 1
fi

CARD_ID="$1"
EXPORT_DIR="${TMPDIR}trello-to-dayone/${CARD_ID}"
JSON_FILE="${EXPORT_DIR}/card.json"

if [[ ! -f "$JSON_FILE" ]]; then
  echo "Error: JSON file not found for card '${CARD_ID}' at ${JSON_FILE}"
  echo "Please run ./download-trello-card.sh ${CARD_ID} first."
  exit 1
fi

# --- Data Extraction ---
echo "Reading data from ${JSON_FILE}..."

CARD_NAME=$(jq -r '.name' "$JSON_FILE")
CARD_DESC=$(jq -r '.desc' "$JSON_FILE")
BOARD_NAME=$(jq -r '.board.name' "$JSON_FILE")
LIST_NAME=$(jq -r '.list.name' "$JSON_FILE")
CARD_URL=$(jq -r '.shortUrl' "$JSON_FILE")

# --- Content Formatting ---

# 1. Title Header
TITLE_HEADER="# ${CARD_NAME}"

# 2. Metadata section
METADATA="${CARD_URL} : ${BOARD_NAME} → ${LIST_NAME}"

echo "--- METADATA DEBUG ---"
echo "$METADATA" | od -c
echo "--- END METADATA DEBUG ---"

# 3. Description
DESC_SECTION=""
if [[ -n "$CARD_DESC" && "$CARD_DESC" != "null" ]]; then
  # Normalize CARD_DESC to prevent excessive newlines
  # Remove leading/trailing newlines and squeeze multiple newlines into one
  CARD_DESC=$(echo "$CARD_DESC" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | tr -s '\n')
  DESC_SECTION="## Description\n${CARD_DESC}"
fi

# 4. Checklists (with corrected grouping)
CHECKLISTS_SECTION="## Checklists"
CHECKLISTS_BODY=$(jq -r -f "scripts/_internal/checklists.jq" "$JSON_FILE")

if [[ -n "$CHECKLISTS_BODY" ]]; then
  CHECKLISTS_SECTION+="\n${CHECKLISTS_BODY}"
else
  CHECKLISTS_SECTION+="\nNo checklists."
fi

# 5. Linked Attachments
LINKED_ATTACHMENTS_SECTION="## Linked Attachments"
LINKED_ATTACHMENTS_BODY=$(jq -r 'try .attachments[] | select(.isUpload == false) | "- " + .url' "${EXPORT_DIR}/attachments.json" 2>/dev/null || echo "")
if [[ -n "$LINKED_ATTACHMENTS_BODY" ]]; then
  LINKED_ATTACHMENTS_SECTION+="\n${LINKED_ATTACHMENTS_BODY}"
else
  LINKED_ATTACHMENTS_SECTION+="\nNo linked attachments."
fi

# 6. Comments
COMMENTS_SECTION="## Comments"
COMMENTS_BODY=$(jq -r -f "scripts/_internal/comments.jq" "$JSON_FILE")

if [[ -n "$COMMENTS_BODY" ]]; then
  COMMENTS_SECTION+="\n${COMMENTS_BODY}"
else
  COMMENTS_SECTION+="\nNo comments."
fi

# --- Assemble Final Entry ---
# Build FULL_ENTRY incrementally to avoid excessive newlines from empty sections
FULL_ENTRY="${TITLE_HEADER}"

# Add METADATA
FULL_ENTRY+="\n\n${METADATA}"

# Add Description if present
if [[ -n "$DESC_SECTION" ]]; then
  FULL_ENTRY+="\n\n${DESC_SECTION}"
fi

# Add Checklists if present
if [[ -n "$CHECKLISTS_BODY" ]]; then
  FULL_ENTRY+="\n\n${CHECKLISTS_SECTION}"
fi

# Add Linked Attachments if present
if [[ -n "$LINKED_ATTACHMENTS_BODY" ]]; then
  FULL_ENTRY+="\n\n${LINKED_ATTACHMENTS_SECTION}"
fi

# Add Comments if present
if [[ -n "$COMMENTS_BODY" ]]; then
  FULL_ENTRY+="\n\n${COMMENTS_SECTION}"
fi

# --- Debug Output ---
echo "--- BEGIN DEBUG OUTPUT ---"
echo "$FULL_ENTRY"
echo "--- END DEBUG OUTPUT ---"

# Start building the command
DAYONE_CMD=("dayone2" "new")

# Add journal
DAYONE_CMD+=("--journal" "cli-import")

# Add tags
DAYONE_CMD+=("--tags" "$BOARD_NAME" "$LIST_NAME")

# Add attachments
ATTACHMENT_DIR="${EXPORT_DIR}/attachments"
ATTACHMENT_PATHS=()
if [ -d "$ATTACHMENT_DIR" ] && [ "$(ls -A "$ATTACHMENT_DIR")" ]; then
  echo "Found attachments to upload..."
  for file in "$ATTACHMENT_DIR"/*; do
    ATTACHMENT_PATHS+=("$file") # Use absolute paths
  done
  # Add the --attachments flag followed by all the file paths
  DAYONE_CMD+=("--attachments" "${ATTACHMENT_PATHS[@]}")
else
  echo "No local attachments to upload."
fi

# Execute the command
FULL_ENTRY_TEMP_FILE=$(mktemp)
echo -e "$FULL_ENTRY" >"$FULL_ENTRY_TEMP_FILE"
echo "Executing Day One command: cat \"$FULL_ENTRY_TEMP_FILE\" | $DAYONE_CMD[@]"
cat "$FULL_ENTRY_TEMP_FILE" | "${DAYONE_CMD[@]}"
rm "$FULL_ENTRY_TEMP_FILE"

echo "---"
echo "✅ Successfully imported card '${CARD_NAME}' to Day One."
