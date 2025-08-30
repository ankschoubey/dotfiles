#!/bin/bash

# trello-to-markdown.sh
#
# Description:
#   Formats a locally downloaded Trello card into a Markdown file.
#
# Usage:
#   ./trello-to-markdown.sh <CARD_ID>
#
# Dependencies:
#   - jq: For parsing the local card.json file.

set -e
set -o pipefail

# --- Validation ---
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
CARD_NAME=$(jq -r '.name' "$JSON_FILE")
CARD_DESC=$(jq -r '.desc' "$JSON_FILE")
BOARD_NAME=$(jq -r '.board.name' "$JSON_FILE")
LIST_NAME=$(jq -r '.list.name' "$JSON_FILE")
CARD_URL=$(jq -r '.shortUrl' "$JSON_FILE")

# --- Content Formatting ---

# 1. Title Header
TITLE_HEADER="# 🎴 ${CARD_NAME}"

# 2. Metadata section
METADATA="${CARD_URL} : \\\`${BOARD_NAME} → ${LIST_NAME}\\\`"

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

echo -e "$FULL_ENTRY"


