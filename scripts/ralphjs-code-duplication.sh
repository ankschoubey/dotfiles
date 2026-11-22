#!/bin/bash
# Ralph loop for jscpd duplication. Delegates mechanics to _internal/ralph.sh.
# shellcheck disable=SC1091
source "$(dirname "$0")/_internal/ralph.sh"

ralph_loop "${MAX_ITER:-200}" "Clone found " "Fix jscpd duplication" \
  "pkill node 2>/dev/null; npx jscpd src | head -n 50; pkill node 2>/dev/null || true"
