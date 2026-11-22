#!/bin/bash
# Ralph loop for eslint. Delegates mechanics to _internal/ralph.sh.
# shellcheck disable=SC1091
source "$(dirname "$0")/_internal/ralph.sh"

ralph_loop "${MAX_ITER:-200}" " error " "Fix eslint" \
  "pkill node 2>/dev/null; npx eslint . | head -n 50" \
  "./ralphjs-fix-test.sh"
