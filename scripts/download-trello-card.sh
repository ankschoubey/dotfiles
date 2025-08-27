#!/bin/bash

# download-trello-card.sh
#
# Description:
#   Downloads all information for a single Trello card, including the main
#   card data (description, comments, etc.) and all attachments.
#
# Usage:
#   ./download-trello-card.sh <CARD_ID>
#
# Dependencies:
#   - curl: For making API requests.
#   - jq: For parsing JSON responses from the Trello API.
#
# Environment Variables:
#   - TRELLO_API_KEY: Your Trello API key.
#   - TRELLO_API_TOKEN: Your Trello API token generated for authentication.

set -e
set -o pipefail

# --- Validation ---
if [[ -z "$TRELLO_API_KEY" || -z "$TRELLO_API_TOKEN" ]]; then
  echo "Error: TRELLO_API_KEY and TRELLO_API_TOKEN environment variables must be set."
  echo "You can get them from: https://trello.com/app-key"
  exit 1
fi

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <CARD_ID>"
  exit 1
fi

CARD_ID="$1"
BASE_URL="https://api.trello.com/1"
AUTH_PARAMS="key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}"

# --- Directory Setup ---
EXPORT_DIR="${TMPDIR}trello-to-dayone/${CARD_ID}"
ATTACHMENTS_DIR="${EXPORT_DIR}/attachments"
mkdir -p "${ATTACHMENTS_DIR}"
echo "Created local directory: ${EXPORT_DIR}"

# --- Fetch Card Data ---
# This fetches the core card details, checklists, and comments (actions).
CARD_URL="${BASE_URL}/cards/${CARD_ID}?${AUTH_PARAMS}&actions=commentCard&checklists=all&board=true&list=true"
echo "Fetching card data for ID: ${CARD_ID}..."
card_json=$(curl --silent "${CARD_URL}")

if echo "$card_json" | grep -q "card not found"; then
  echo "Error: Card with ID '${CARD_ID}' not found."
  rm -rf "trello_exports/${CARD_ID}"
  exit 1
fi

echo "$card_json" >"${EXPORT_DIR}/card.json"
echo "Successfully saved card data to ${EXPORT_DIR}/card.json"

# --- Fetch and Download Attachments ---
ATTACHMENTS_URL="${BASE_URL}/cards/${CARD_ID}/attachments?${AUTH_PARAMS}"
echo "Fetching attachment list..."
attachments_json=$(curl --silent "${ATTACHMENTS_URL}")

# Filter for actual file uploads, not linked URLs.
uploaded_attachments_json=$(echo "$attachments_json" | jq '[.[] | select(.isUpload == true)]')

if [[ $(echo "$uploaded_attachments_json" | jq 'length') -eq 0 ]]; then
  echo "No downloadable attachments found for this card."
else
  echo "Downloading attachments..."
  echo "$uploaded_attachments_json" | jq -c '.[]' | while read -r attachment; do
    url=$(echo "$attachment" | jq -r '.url')
    name=$(echo "$attachment" | jq -r '.name')

    echo "  -> Downloading: ${name}"
    curl --silent --location "${url}" \
      --header "Authorization: OAuth oauth_consumer_key=\"${TRELLO_API_KEY}\", oauth_token=\"${TRELLO_API_TOKEN}\"" \
      -o "${ATTACHMENTS_DIR}/${name}"
  done
  echo "All attachments downloaded to ${ATTACHMENTS_DIR}"
fi

echo "---"
echo "✅ Download complete for card ${CARD_ID}."

