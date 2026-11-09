#!/bin/bash
# lint.sh — shellcheck + shfmt gate for scripts/ and raycast/scripts/.
# Usage: scripts/lint.sh [--fix]
set -euo pipefail

export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/local/bin:$PATH"

missing=0
command -v shellcheck >/dev/null || {
  echo "missing: shellcheck (brew install shellcheck)"
  missing=1
}
command -v shfmt >/dev/null || {
  echo "missing: shfmt (brew install shfmt)"
  missing=1
}
[ "$missing" -eq 0 ] || exit 1

# SC only handles sh/bash/dash/ksh: skip #!/bin/zsh Raycast wrappers
# and improve-prompts.sh (pre-existing prose-as-code, needs rewrite, not lint).
BASH_FILES=$(grep -rL '^#!/bin/zsh' scripts raycast/scripts --include='*.sh' --include='ai' 2>/dev/null | grep -v 'raycast/scripts/improve-prompts.sh' || true)
# shellcheck disable=SC2086
shellcheck -S warning $BASH_FILES

# shfmt scoped to files hardened in launchd-PATH fix; whole-tree
# normalization is follow-up (would reformat untouched scripts).
SHFMT_FILES="scripts/lint.sh scripts/quitAerospace.sh scripts/restartAerospace.sh scripts/reload-aerospace.sh scripts/set-primary-full.sh scripts/set-primary-low.sh scripts/set-secondary-1080.sh scripts/set-secondary-full.sh scripts/setup-recording.sh scripts/toggle-wallpaper.sh scripts/handle_whatsapp.sh scripts/handle_heynote.sh scripts/download-trello-card.sh scripts/import-to-dayone.sh scripts/trello-to-markdown.sh scripts/ai scripts/pick-next-session.sh scripts/setup-skills.sh scripts/open-chatgpt-if-not-opened.sh"
if [ "${1:-}" = "--fix" ]; then
  # shellcheck disable=SC2086
  shfmt -w -i 2 -ci $SHFMT_FILES raycast/scripts/quit-aerospace.sh raycast/scripts/restart-aerospace.sh raycast/scripts/toggle-wallpaper.sh
else
  # shellcheck disable=SC2086
  shfmt -d -i 2 -ci $SHFMT_FILES raycast/scripts/quit-aerospace.sh raycast/scripts/restart-aerospace.sh raycast/scripts/toggle-wallpaper.sh
fi

echo "lint ok: shellcheck + shfmt clean"
